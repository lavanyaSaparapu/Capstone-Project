import re
import io
import docx2txt
from PyPDF2 import PdfReader
from typing import Dict, Any, List

# List of common skills to match in parsing
COMMON_SKILLS = [
    # Frontend
    "javascript", "typescript", "react", "angular", "vue", "html", "css", "tailwind", "sass", "next.js", "nextjs", "vite", "redux", "gsap", "framer motion",
    # Backend
    "python", "java", "c++", "c#", "go", "golang", "rust", "php", "ruby", "node.js", "nodejs", "express", "fastapi", "django", "flask", "spring boot",
    # Databases
    "postgresql", "mysql", "sqlite", "mongodb", "redis", "dynamodb", "cassandra", "oracle", "sql", "nosql",
    # Cloud & DevOps
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "gitlab", "ci/cd", "jenkins", "terraform", "ansible", "nginx",
    # AI & ML
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "pandas", "numpy", "spacy", "nltk", "transformers", "huggingface", "llm", "langchain",
    # Soft skills & Methodologies
    "agile", "scrum", "project management", "system design", "microservices", "rest api", "graphql", "websockets"
]

def clean_text(text: str) -> str:
    """Cleans text by removing unnecessary whitespace and special characters."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from a PDF file."""
    pdf_file = io.BytesIO(file_bytes)
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts raw text from a DOCX file."""
    docx_file = io.BytesIO(file_bytes)
    text = docx2txt.process(docx_file)
    return text

def extract_emails(text: str) -> List[str]:
    """Extracts email addresses from text and cleans trailing punctuation."""
    pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    matches = re.findall(pattern, text)
    cleaned_emails = []
    for email in matches:
        # Strip trailing periods, commas, or question marks commonly found in text sentences
        email_clean = email.rstrip('.,?!')
        if email_clean:
            cleaned_emails.append(email_clean)
    return cleaned_emails

def extract_phones(text: str) -> List[str]:
    """Extracts phone numbers from text."""
    pattern = r'(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?'
    matches = re.findall(pattern, text)
    phones = []
    for match in matches:
        phone = "-".join([part for part in match if part])
        if phone:
            phones.append(phone)
    return phones

def extract_links(text: str) -> Dict[str, str]:
    """Extracts GitHub, LinkedIn, and Portfolio links from text."""
    links = {}
    github_pattern = r'(https?://(?:www\.)?github\.com/[a-zA-Z0-9_-]+)'
    linkedin_pattern = r'(https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+)'
    portfolio_pattern = r'(https?://(?:www\.)?(?!github|linkedin)[a-zA-Z0-9_-]+\.[a-z]{2,}(?:/[a-zA-Z0-9_-]+)*)'

    github_match = re.search(github_pattern, text, re.IGNORECASE)
    linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
    portfolio_match = re.search(portfolio_pattern, text, re.IGNORECASE)

    if github_match:
        links["github"] = github_match.group(1)
    if linkedin_match:
        links["linkedin"] = linkedin_match.group(1)
    if portfolio_match:
        links["portfolio"] = portfolio_match.group(1)

    return links

def extract_name(text: str) -> str:
    """
    Extracts the candidate's name.
    Attempts Named Entity Recognition (NER) if spaCy is loaded,
    otherwise falls back to parsing the first line of text.
    """
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(text[:1000])  # Scan first 1000 chars for candidate name
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                # Ensure the name is realistic (2-3 words, no numbers/symbols)
                name = ent.text.strip()
                if len(name.split()) >= 2 and len(name.split()) <= 4 and not re.search(r'\d', name):
                    return name
    except Exception:
        pass
    
    # Fallback: Check the first few lines of text
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        for line in lines[:3]:
            # Take the first line that looks like a name (only alphabetical characters and spaces)
            if re.match(r'^[a-zA-Z\s]{3,30}$', line):
                return line
        return lines[0][:50]
    return "Candidate Name"

def extract_skills(text: str) -> List[str]:
    """Extracts matched skills from the common skills list."""
    matched = []
    text_lower = text.lower()
    for skill in COMMON_SKILLS:
        # Use word boundaries to avoid partial matches (e.g., 'go' inside 'google')
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            matched.append(skill)
    # Remove duplicates and format nicely
    return list(set([s.title() if len(s) > 3 else s.upper() for s in matched]))

def extract_experience_years(text: str) -> float:
    """Heuristic to extract total years of experience mentioned in text."""
    years = 0.0
    pattern = r'(\d+(?:\.\d+)?)\s*(?:\+)?\s*years?(?:\s+of)?\s+experience'
    matches = re.findall(pattern, text, re.IGNORECASE)
    if matches:
        try:
            years = max(float(m) for m in matches)
        except ValueError:
            pass
    return years

def parse_resume_content(text: str, filename: str) -> Dict[str, Any]:
    """Main parsing orchestrator that structures resume text into structured fields."""
    cleaned = clean_text(text)
    emails = extract_emails(cleaned)
    phones = extract_phones(cleaned)
    links = extract_links(cleaned)
    name = extract_name(text)
    skills = extract_skills(cleaned)
    years_exp = extract_experience_years(cleaned)
    
    # Simple section splitting to find projects, education, work history
    sections = {"experience": "", "education": "", "projects": ""}
    
    current_section = None
    lines = text.split("\n")
    for line in lines:
        line_clean = line.strip().lower()
        if any(h in line_clean for h in ["work experience", "professional experience", "employment history", "experience"]):
            current_section = "experience"
            continue
        elif any(h in line_clean for h in ["education", "academic background", "qualification"]):
            current_section = "education"
            continue
        elif any(h in line_clean for h in ["projects", "personal projects", "key projects"]):
            current_section = "projects"
            continue
        
        # Append to current section
        if current_section and line.strip():
            sections[current_section] += line.strip() + "\n"

    # Clean sections
    for k in sections:
        sections[k] = clean_text(sections[k])

    # Basic score evaluation (out of 100)
    grammar_score = 90.0  # Simulated grammar score
    if len(text) < 500:
        grammar_score -= 20.0
    
    # Calculate simple keyword density
    words = [w.lower() for w in re.findall(r'\b[a-zA-Z]{3,15}\b', text.lower())]
    total_words = len(words)
    density = {}
    if total_words > 0:
        for skill in skills:
            count = words.count(skill.lower())
            if count > 0:
                density[skill] = round((count / total_words) * 100, 2)
    
    resume_quality = 70.0
    if emails: resume_quality += 10
    if phones: resume_quality += 5
    if len(skills) >= 5: resume_quality += 10
    if len(skills) >= 10: resume_quality += 5
    
    return {
        "name": name,
        "email": emails[0] if emails else "",
        "phone": phones[0] if phones else "",
        "links": links,
        "skills": skills,
        "experience_years": years_exp,
        "sections": sections,
        "resume_quality_score": min(resume_quality, 100.0),
        "grammar_score": grammar_score,
        "keyword_density": density,
        "raw_text": text
    }
