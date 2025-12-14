import os
import requests
from fastapi import APIRouter, Query
from dotenv import load_dotenv
import re
from datetime import datetime

load_dotenv()
router = APIRouter()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
print("Loaded API Key:", RAPIDAPI_KEY)  # debug

LOCATIONS = ["usa", "us", "india", "new york", "washington", "chicago", "california", "london"]

# Strict software filter
SOFTWARE_TERMS = ["software", "developer", "engineer", "programmer", "tech",
                  "it", "fullstack", "frontend", "backend", "cloud", "ai", "ml", "data",
                  "sql", "devops"]

# Tech/role keywords
TECH_KEYWORDS = ["python", "java", "react", "node", "aws", "ml", "ai", "data",
                 "sql", "cloud", "devops", "full stack", "backend", "frontend"]

DATE_PATTERN = r"\b(\d{4})-(\d{2})-(\d{2})\b"  # yyyy-mm-dd


@router.get("/search")
def search_jobs(query: str = Query(..., description="Job search query"), page: int = 1):
    url = "https://jsearch.p.rapidapi.com/search"

    headers = {
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY
    }

    # Extract location
    location = None
    for loc in LOCATIONS:
        if loc in query.lower():
            location = loc
            break

    # Extract exact date (yyyy-mm-dd)
    date_match = re.search(DATE_PATTERN, query)
    date_filter = date_match.group(0) if date_match else None

    # Extract company name (heuristic: "X company")
    company_match = None
    if "company" in query.lower():
        words = query.lower().split()
        for i, w in enumerate(words):
            if w == "company" and i > 0:
                company_match = words[i - 1]  # word before "company"
                break

    # Extract tech keyword from query
    tech_match = None
    for tech in TECH_KEYWORDS:
        if tech in query.lower():
            tech_match = tech
            break

    # ✅ Send full query to API, don’t override
    params = {"query": query, "page": page, "num_pages": 1}
    if location:
        params["location"] = location

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        jobs = []
        for job in data.get("data", []):
            title = job.get("job_title", "").lower()
            desc = (job.get("job_description") or "").lower()
            company = (job.get("employer_name") or "").lower()

            # ✅ Strict software filter
            if not any(word in title for word in SOFTWARE_TERMS):
                continue

            # ✅ Tech keyword filter
            if tech_match and (tech_match not in title and tech_match not in desc):
                continue

            # ✅ Company filter
            if company_match and company_match not in company:
                continue

            # ✅ Exact date filter
            if date_filter:
                parsed_date = datetime.strptime(date_filter, "%Y-%m-%d").date()
                posted_at = job.get("job_posted_at_datetime_utc")
                if not posted_at:
                    continue
                try:
                    posted_date = datetime.fromisoformat(posted_at.replace("Z", "")).date()
                    if posted_date != parsed_date:
                        continue
                except Exception:
                    continue

            jobs.append({
                "id": job.get("job_id"),
                "title": job.get("job_title"),
                "company": job.get("employer_name"),
                "location": job.get("job_city") or job.get("job_location"),
                "job_type": job.get("job_employment_type"),
                "salary": job.get("job_max_salary") or job.get("job_salary_currency") or "Not Disclosed",
                "posted": job.get("job_posted_at_datetime_utc"),
                "skills_required": job.get("job_required_skills"),
                "experience_required": job.get("job_required_experience", {}).get("required_experience_in_months"),
                "company_website": job.get("employer_website"),
                "company_support": job.get("employer_logo"),
                "apply_link": job.get("job_apply_link"),
                "hr_email": job.get("job_publisher_email") or "Not Available",
                "hr_contact": job.get("job_publisher_name") or "Not Available",
            })

        return {"status": "success", "results": jobs}

    except Exception as e:
        return {
            "error": "Failed to fetch jobs",
            "details": str(e)
        }
