from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
import os
from datetime import datetime
import time
from threading import Thread

import re
from urllib.parse import urlparse

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domain for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Azure AI Project client
project_client = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str="eastus2.api.azureml.ms;2c33e03c-3b25-4174-8086-feed9ee27475;rg-totalenergies-poc-001;pg-totalenergies-002"
)

agent = project_client.agents.get_agent("asst_U9KpEw87sohTIehrF1YcLu9E")
# agent = project_client.agents.get_agent("asst_ENyv4TztKmOh6pGzbEKkQb93") //Telegram bot agent_id
# agent = project_client.agents.get_agent("asst_dCMd8kbnDY8DudRQz81o8cpl")
# agent = project_client.agents.get_agent("asst_KOMxo3ifg2Sd5eEnEZ4xkAy1")
# agent = project_client.agents.get_agent("asst_n7nad4ugvXrdkGmAlRRSYTcj")

# thread = project_client.agents.get_thread("thread_GY4VkMQLeLYooyCIWn63X0Ac")
# thread = project_client.agents.get_thread("thread_UohTaszgCO8mAR99KwLKDity")
# thread = project_client.agents.get_thread("thread_KlOYBB0mFgg5s7mZJfMC20I6")
# thread = project_client.agents.get_thread("")


chat_buffer = []  # List of {"user": ..., "bot": ...}
last_message_time = None
TIMEOUT_SECONDS = 60

def background_log_writer():
    global last_message_time, chat_buffer
    print("[DEBUG] Background log writer started.")
    while True:
        if last_message_time and (time.time() - last_message_time > TIMEOUT_SECONDS):
            if chat_buffer:
                log_file = get_next_log_filename()
                with open(log_file, "w", encoding="utf-8") as f:
                      for pair in chat_buffer:
                        f.write(f"User: {pair['user']}\n")
                        f.write(f"Bot: {pair['bot']}\n\n")
                print(f"[DEBUG] Timeout log saved: {log_file}")
            chat_buffer = []
            last_message_time = None
        time.sleep(5)
Thread(target=background_log_writer, daemon=True).start()

 

thread = project_client.agents.create_thread()
CHAT_LOG_DIR = "chat_logs"
os.makedirs(CHAT_LOG_DIR, exist_ok=True)

def get_next_log_filename():
    existing_files = [f for f in os.listdir(CHAT_LOG_DIR) if f.startswith("TE") and f.endswith(".txt")]
    numbers = []
    for fname in existing_files:
        try:
            num = int(fname[2:].split('_')[0])
            numbers.append(num)
        except (ValueError, IndexError):
            continue
    next_num = max(numbers) + 1 if numbers else 1
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return os.path.join(CHAT_LOG_DIR, f"TE{next_num}_{timestamp}.txt")

# Define input schema
class MessageInput(BaseModel):
    message: str

class FileRequest(BaseModel):
    filename: str

@app.get("/chat_history")
def get_chat_history():
    try:
        files = [
            f for f in os.listdir(CHAT_LOG_DIR)
            if f.endswith(".txt") and f.startswith("TE")
        ]
        files.sort(reverse=True)  # Optional: latest first
        return {"history": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.post("/chat_content")
def get_chat_content(request: FileRequest):
    filepath = os.path.join(CHAT_LOG_DIR, request.filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Chat file not found.")

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.read().splitlines()

        chat_pairs = []
        current_pair = {}
        capturing_bot = False

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if line.startswith("User:"):
                if current_pair:
                    chat_pairs.append(current_pair)
                    current_pair = {}
                current_pair["user"] = line.replace("User:", "").strip()
                capturing_bot = False

            elif line.startswith("Bot:"):
                current_pair["bot"] = line.replace("Bot:", "").strip()
                capturing_bot = True

            elif capturing_bot:
                # Append additional lines of bot's answer
                current_pair["bot"] += " " + line.strip()

        # Append final pair
        if current_pair:
            chat_pairs.append(current_pair)

        return {
            "filename": request.filename,
            "chat_history": chat_pairs
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.post("/orch_agent")
def chat_with_bot(payload: MessageInput):
    global chat_buffer, last_message_time
    try:
        user_message = payload.message

        # Send user message
        project_client.agents.create_message(
            thread_id=thread.id,
            role="user",
            content=user_message
        )
        project_client.agents.create_and_process_run(
            thread_id=thread.id,
            agent_id=agent.id
        )

        messages = project_client.agents.list_messages(thread_id=thread.id)
        for text_message in messages.text_messages:
            raw_response = text_message.text['value']
            print("🔍 Raw Bot Reply:", raw_response)

            # Step 1: Clean metadata
            lines = raw_response.strip().split("\n")
            clean_lines = [
                line for line in lines
                if not line.lower().startswith("question") and not line.lower().startswith("answer")
            ]
            full_text = "\n".join(clean_lines).strip()

            # Step 2: Extract all citation tags and URLs
            citation_tags = re.findall(r"【\d+[:：]?\d*[^】]*】", full_text)
            urls = re.findall(r"https?://t\.me/[^\s)\]\"<]+", full_text)

            citation_map = {}
            url_map = {}
            citation_counter = 1

            for i, tag in enumerate(citation_tags):
                if tag not in citation_map:
                    citation_map[tag] = citation_counter

                    # Map to URL if available
                    url = urls[i] if i < len(urls) else "https://t.me/"
                    url_map[tag] = url
                    citation_counter += 1

            # Step 3: Replace citation tags with superscripts
            for tag, number in citation_map.items():
                full_text = full_text.replace(tag, f"<sup><a href='#{number}'>[{number}]</a></sup>")

            # Step 4: Format final HTML
            formatted = ""
            for line in full_text.split("\n"):
                line = line.strip()
                if line:
                    formatted += f"<p>{line}</p>\n"

            # Step 5: Build dynamic source list
            sources = []
            for tag, num in citation_map.items():
                url = url_map[tag]
                hostname = urlparse(url).netloc.replace("www.", "")
                channel_name = url.strip("/").split("/")[-1]
                sources.append({
                    "id": num,
                    "name": f"Source {num} – {channel_name}",
                    "url": url
                })

            # Save to buffer
            chat_buffer.append({"user": user_message, "bot": formatted.strip()})
            last_message_time = time.time()

            return {
                "response": formatted.strip(),
                "sources": sources,
                "chat_log_file": None
            }

        return {"response": "Sorry, no valid response.", "sources": []}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
  

# @app.post("/orch_agent")
# def chat_with_bot(payload: MessageInput):
#     try:
#         user_message = payload.message

#         # Send user message to Azure Agent
#         project_client.agents.create_message(
#             thread_id=thread.id,
#             role="user",
#             content=user_message
#         )

#         project_client.agents.create_and_process_run(
#             thread_id=thread.id,
#             agent_id=agent.id
#         )

#         messages = project_client.agents.list_messages(thread_id=thread.id)
#         for text_message in messages.text_messages:
#             bot_reply = text_message.text['value']
#             print("========End of bot reply=====")
#             print(bot_reply)
#             print("========End of bot reply=====")
#         # Parse line-by-line and extract "Answer (in English)"
#             answer_text = None
#             for line in bot_reply.strip().split("\n"):
#                 if line.startswith("Answer (in English):"):
#                     answer_text = line.replace("Answer (in English):", "").strip()
#                     break

#             if not answer_text:
#                 answer_text = bot_reply.strip()

#             # Save full bot reply to log file
#             log_file_path = get_next_log_filename()
#             with open(log_file_path, "w", encoding="utf-8") as f:
#                 f.write(f"User: {user_message}\nBot: {bot_reply}\n")

#             return {
#                 "response": answer_text,
#                 "chat_log_file": os.path.basename(log_file_path)
#             }

#         return {"response": "Sorry, I didn't understand that."}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))



# new orch_agent
# @app.post("/orch_agent")
# def chat_with_bot(payload: MessageInput):
#     global chat_buffer, last_message_time
#     try:
#         user_message = payload.message

#         project_client.agents.create_message(
#             thread_id=thread.id,
#             role="user",
#             content=user_message
#         )

#         project_client.agents.create_and_process_run(
#             thread_id=thread.id,
#             agent_id=agent.id
#         )

#         messages = project_client.agents.list_messages(thread_id=thread.id)
#         for text_message in messages.text_messages:
#             bot_reply = text_message.text['value']

#             cleaned_lines = [
#                 line.lstrip("- ").strip()
#                 for line in bot_reply.strip().split("\n")
#                 if line.strip()
#             ]

#             response_dict = {}
#             for line in cleaned_lines:
#                 if ":" in line:
#                     key, value = line.split(":", 1)
#                     response_dict[key.strip()] = value.strip()

#             # Append message pair to buffer
#             chat_buffer.append({
#                 "user": user_message,
#                 "bot": bot_reply
#             })
#             last_message_time = time.time()

#             return {"response": response_dict, "chat_log_file": None}

#         return {"response": "Sorry, I didn't understand that."}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))




# @app.post("/orch_agent")
# def chat_with_bot(payload: MessageInput):
#     global chat_buffer, last_message_time
#     try:
#         user_message = payload.message

#         # Send user message
#         project_client.agents.create_message(
#             thread_id=thread.id,
#             role="user",
#             content=user_message
#         )
#         project_client.agents.create_and_process_run(
#             thread_id=thread.id,
#             agent_id=agent.id
#         )

#         messages = project_client.agents.list_messages(thread_id=thread.id)
#         for text_message in messages.text_messages:
#             raw_response = text_message.text['value']
#             print("🔍 Raw Bot Reply:", raw_response)

#             # Step 1: Clean metadata
#             lines = raw_response.strip().split("\n")
#             clean_lines = [
#                 line for line in lines
#                 if not line.lower().startswith("question") and not line.lower().startswith("answer")
#             ]
#             full_text = "\n".join(clean_lines).strip()

#             # Step 2: Extract all citation tags and URLs
#             citation_tags = re.findall(r"【\d+[:：]?\d*[^】]*】", full_text)
#             urls = re.findall(r"https?://t\.me/[^\s)\]\"<]+", full_text)

#             citation_map = {}
#             url_map = {}
#             citation_counter = 1

#             for i, tag in enumerate(citation_tags):
#                 if tag not in citation_map:
#                     citation_map[tag] = citation_counter

#                     # Map to URL if available
#                     url = urls[i] if i < len(urls) else "https://t.me/"
#                     url_map[tag] = url
#                     citation_counter += 1

#             # Step 3: Replace citation tags with superscripts
#             for tag, number in citation_map.items():
#                 full_text = full_text.replace(tag, f"<sup><a href='#{number}'>[{number}]</a></sup>")

#             # Step 4: Format final HTML
#             formatted = ""
#             for line in full_text.split("\n"):
#                 line = line.strip()
#                 if line:
#                     formatted += f"<p>{line}</p>\n"

#             # Step 5: Build dynamic source list
#             sources = []
#             for tag, num in citation_map.items():
#                 url = url_map[tag]
#                 hostname = urlparse(url).netloc.replace("www.", "")
#                 channel_name = url.strip("/").split("/")[-1]
#                 sources.append({
#                     "id": num,
#                     "name": f"Source {num} – {channel_name}",
#                     "url": url
#                 })

#             # Save to buffer
#             chat_buffer.append({"user": user_message, "bot": formatted.strip()})
#             last_message_time = time.time()

#             return {
#                 "response": formatted.strip(),
#                 "sources": sources,
#                 "chat_log_file": None
#             }

#         return {"response": "Sorry, no valid response.", "sources": []}

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
 