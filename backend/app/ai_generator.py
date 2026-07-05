import os
from typing import Dict, Any, List
from app.config import settings

def call_llm(prompt: str, system_instruction: str = "") -> str:
    """
    Attempts to call an LLM (OpenAI or Gemini) if API keys are set in Settings.
    Otherwise, returns empty string to trigger local high-fidelity mock generators.
    """
    # Try OpenAI
    if settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API call failed: {e}")
            
    # Try Gemini (via google-generativeai or HTTP fallback)
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_instruction
            )
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API call failed: {e}")
            
    return ""

def generate_interview_questions(resume_name: str, skills: List[str], job_title: str, job_desc: str) -> List[str]:
    """Generates technical, behavioral, and situational interview questions."""
    skills_str = ", ".join(skills)
    prompt = f"Generate 5 interview questions for candidate {resume_name} applying for job '{job_title}' with skills: {skills_str}. Include technical and behavioral questions."
    system_instruction = "You are a professional recruiting coordinator. Provide 5 realistic interview questions separated by double-newlines."
    
    llm_output = call_llm(prompt, system_instruction)
    if llm_output:
        questions = [q.strip() for q in llm_output.split("\n\n") if q.strip()]
        if len(questions) >= 3:
            return questions[:5]
            
    # Local high-fidelity generator fallback
    questions = [
        f"Technical: Can you walk us through how you would apply {skills[0] if skills else 'Software Engineering Principles'} to architect a high-scale service for our {job_title} role?",
        f"Scenario-Based: In your previous work, how did you handle integration hurdles? Describe a project where things didn't go as planned.",
    ]
    if len(skills) > 1:
        questions.append(f"Deep-dive: Explain a complex project where you leveraged {skills[1]} and how you measured its success.")
    else:
        questions.append("Deep-dive: How do you stay updated with the latest tools and best practices in development?")
        
    questions.extend([
        f"Culture: Why are you interested in joining our team as a {job_title}, and how does this role align with your long-term career aspirations?",
        "Behavioral: Tell me about a time you had a technical disagreement with a team member. How did you handle it, and what was the outcome?"
    ])
    return questions

def generate_cover_letter(candidate_name: str, skills: List[str], job_title: str, company: str = "your esteemed organization") -> str:
    """Generates a professional, custom-crafted cover letter."""
    skills_str = ", ".join(skills[:5])
    prompt = f"Write a professional cover letter for {candidate_name} applying to the {job_title} role at {company}. The candidate has skills in: {skills_str}."
    system_instruction = "You are an expert resume writer. Write a formal, compelling, and ready-to-send cover letter."
    
    llm_output = call_llm(prompt, system_instruction)
    if llm_output:
        return llm_output
        
    # Local high-fidelity generator fallback
    skills_clause = f"skills in {skills_str}" if skills else "experience in software development"
    return f"""Dear Hiring Team,

I am writing to express my enthusiastic interest in the {job_title} position at {company}. With a strong background in software engineering and practical {skills_clause}, I am confident in my ability to make an immediate impact on your engineering department.

Throughout my career, I have consistently focused on building scalable, clean, and highly maintainable software applications. My technical toolkit aligns directly with the requirements outlined in your job posting. I take pride in understanding system architecture, refining user experiences, and collaborating in agile settings to ship features rapidly and securely.

I am particularly excited about {company} because of your dedication to engineering excellence and user-focused SaaS delivery. I would welcome the opportunity to discuss how my qualifications, project leadership, and technical capabilities can support your team's objectives.

Thank you for your time and consideration.

Sincerely,
{candidate_name}
"""

def generate_resume_suggestions(resume_text: str, job_title: str, job_desc: str, missing_skills: List[str]) -> Dict[str, Any]:
    """Analyzes resume text against a target job and details specific improvement suggestions."""
    missing_str = ", ".join(missing_skills) if missing_skills else "none"
    prompt = f"Review this resume text for a {job_title} job. Missing skills compared to JD: {missing_str}. Provide suggestions."
    system_instruction = "You are a professional resume auditor. Output a bulleted list of 4 key improvements."
    
    llm_output = call_llm(prompt, system_instruction)
    suggestions_list = []
    if llm_output:
        suggestions_list = [s.strip().replace("- ", "").replace("* ", "") for s in llm_output.split("\n") if s.strip()]
        
    if not suggestions_list:
        # Local high-fidelity generator fallback
        suggestions_list = [
            f"Increase keyword prominence for missing core competencies: {', '.join(missing_skills[:3]) if missing_skills else 'cloud architecture standards'}.",
            "Quantify project achievements (e.g., 'improved latency by 35%' or 'scaled API capacity to handle 10k requests/min') to demonstrate engineering impact.",
            "Refine the profile summary to emphasize system architecture experience and fit for senior-level placement.",
            "List certifications and tools in a dedicated sidebar to improve readability for quick visual scans by HR recruiters."
        ]
        
    return {
        "ats_score_impact": 15 if missing_skills else 5,
        "suggestions": suggestions_list,
        "actionable_steps": [
            "1. Edit the skills block of your resume and weave in missing items naturally.",
            "2. Focus on action verbs (Designed, Created, Managed) in your job descriptions.",
            "3. Export resume in clean, standard PDF formatting to allow easy text indexing."
        ]
    }
