from fastapi import APIRouter
from pydantic import BaseModel
from app.routers import jobs  # import jobs router
import re
from datetime import datetime

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

# Keywords
JOB_KEYWORDS = ["job", "jobs", "developer", "engineer", "analyst", "designer",
                "manager", "intern", "hiring", "vacancy", "opening"]
TECH_KEYWORDS = ["python", "java", "react", "node", "aws", "ml", "ai", "data",
                 "sql", "cloud", "devops", "software", "full stack", "backend", "frontend"]
LOCATIONS = ["usa", "us", "india", "new york", "washington", "chicago",
             "california", "london"]

GREETINGS = ["hi", "hello", "hey", "good morning", "good evening"]
THANKS = ["thank you", "thanks", "thx", "ty"]

SOFTWARE_KEYWORDS = ["developer", "engineer", "programmer", "analyst", "architect",
                     "full stack", "frontend", "backend", "devops", "cloud",
                     "ml", "ai", "data", "sql", "java", "python", "node", "react", "software"]

DATE_PATTERN = r"\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b"  # dd-mm-yyyy or dd/mm/yyyy


def normalize_date(user_message: str) -> str:
    """Convert dates like dd-mm-yyyy → yyyy-mm-dd"""
    match = re.search(DATE_PATTERN, user_message)
    if match:
        day, month, year = match.groups()
        try:
            dt = datetime.strptime(f"{day}-{month}-{year}", "%d-%m-%Y")
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            return None
    return None


def is_software_job(job):
    """Return True if the job is software/IT based"""
    title = (job.get("title") or "").lower()
    skills = (job.get("skills_required") or "").lower()
    return any(kw in title or kw in skills for kw in SOFTWARE_KEYWORDS)


@router.post("/")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message.strip()
    lower = user_message.lower()

    # 1. Greetings
    if any(greet in lower for greet in GREETINGS):
        return {"reply": "👋Hi there! I'm ValiantTek Job Assistant Bot, How may I assist you today?"}

    # 2. Thanks
    if any(t in lower for t in THANKS):
        return {"reply": "🙏 You’re welcome! Wishing you success in your job search 🚀"}

    # 3. Detect if job query
    is_job_query = False
    search_query = user_message

    if (any(word in lower for word in JOB_KEYWORDS + TECH_KEYWORDS + LOCATIONS)
        or re.search(DATE_PATTERN, lower)):
        is_job_query = True

    # Case: company name
    if not is_job_query:
        words = lower.split()
        if 1 <= len(words) <= 3:  # e.g., "google", "amazon jobs"
            is_job_query = True
            search_query = f"{user_message} company"

    # Normalize date
    date_str = normalize_date(lower)
    if date_str:
        is_job_query = True
        search_query = f"software jobs posted on {date_str}"

    # 4. Handle job queries
    if is_job_query:
        try:
            jobs_data = jobs.search_jobs(search_query)

            if jobs_data.get("results"):
                filtered_jobs = [job for job in jobs_data["results"] if is_software_job(job)]

                if not filtered_jobs:
                    return {"reply": "⚠️ I found jobs, but none are software-related. Try refining your query with IT roles like 'developer', 'engineer', or 'analyst'."}

                job_texts = ["🚀 Showing top software matches 🔎🔥\n━━━━━━━━━━━━━━━━━━━━━━"]
                for idx, job in enumerate(filtered_jobs, start=1):
                    job_texts.append(
                        f"🌟 **{job.get('title')}**\n"
                        f"➡️ **Company:** {job.get('company')}\n"
                        f"➡️ **Location:** {job.get('location')}\n"
                        f"➡️ **Job Type:** {job.get('job_type')}\n"
                        f"➡️ **Salary:** {job.get('salary')}\n"
                        f"➡️ **Posted On:** {job.get('posted')}\n"
                        f"➡️ **Skills Required:** {job.get('skills_required') or 'Not Provided'}\n"
                        f"➡️ **Experience Required:** {job.get('experience_required') or 'Not Provided'}\n"
                        f"➡️ **Company Website:** {job.get('company_website') or 'Not Available'}\n"
                        f"➡️ **Apply Link:** {job.get('apply_link') or 'Not Available'}\n"
                        f"➡️ **HR Email:** {job.get('hr_email')}\n"
                        f"➡️ **HR Contact:** {job.get('hr_contact')}\n"
                        f"────────────────────────────"
                    )

                reply = "\n\n".join(job_texts)
                return {"reply": reply}

            else:
                return {"reply": "⚠️ Sorry, no software job listings found for your request. Try another role, company, or location."}

        except Exception:
            return {"reply": "🚨 The server is busy or unavailable right now. Please try again shortly."}

    # 5. Partial matches
    if "career" in lower or "work" in lower or "profession" in lower:
        return {"reply": "💡 Did you mean software job opportunities? Try asking about a specific IT role, company, or location."}

    # 6. Fallback
    return {"reply": "🤖 I didn’t quite get that. Try asking me about a software job role, company, location, or date."}
