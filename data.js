/* ============================================================
   data.js — the only file you edit to update this portfolio.
   Nothing here is layout. Add an object, reload, it renders.

   Exported from the page's edit mode (#edit). Section numbers are
   derived from array order — never hardcode them.

   kind must be one of: prose | register | assessments |
                        credentials | matrix | contact
   status: 'current' | 'progress' | 'done'
   Leave a link as null and the renderer omits it.
   ============================================================ */

const PROFILE = {
  "name": "Ammar Alzaiem",
  "role": "Web Application Security · Penetration Testing",
  "location": "Damascus, Syria",
  "email": "ammaralzaiem@outlook.com",
  "phone": "+963 944 408 199",
  "links": [
    {
      "label": "GitHub",
      "href": "https://github.com/ammaralzaiem"
    },
    {
      "label": "LinkedIn",
      "href": "https://www.linkedin.com/in/ammaralzaiem99"
    },
    {
      "label": "Credly",
      "href": "https://www.credly.com/users/ammar-alzaiem/badges"
    }
  ]
};

const SECTIONS = [
  {
    "id": "profile",
    "label": "Profile",
    "kind": "prose",
    "body": [
      "Information Engineering student working toward a career in offensive security, with a focus on web application testing. My practice is built on hands-on labs rather than coursework alone — TryHackMe, PortSwigger Web Security Academy, and OWASP Juice Shop — and on task-based internships where each finding had to be reproduced, evidenced, and written up.",
      "Comfortable across the full assessment cycle: reconnaissance and enumeration, vulnerability analysis, controlled exploitation, and reporting. Working knowledge of Linux, networking, Docker, and the web stack underneath the targets I test."
    ]
  },
  {
    "id": "engagements",
    "label": "Engagements",
    "kind": "register",
    "note": "Internships and structured programmes, most recent first.",
    "entries": [
      {
        "period": "Sep 2026 — Oct 2026",
        "status": "done",
        "title": "VAPT Intern",
        "org": "TriosCyber",
        "points": [
          "Completed 30 structured practical tasks covering reconnaissance, network scanning, enumeration, web testing, vulnerability assessment, manual validation, and professional reporting.",
          "Participated in 4 live technical sessions (8 hours total) covering VAPT methodology, OWASP Top 10, HTTP/web fundamentals, and manual testing.",
          "Used Nmap, Burp Suite, WhatWeb, Gobuster/FFUF, Nikto, Nuclei, Kali Linux, WHOIS, and DNS tools in authorized lab environments."
        ]
      },
      {
        "period": "Aug 2026 — Oct 2026",
        "status": "done",
        "title": "Ethical Hacker Intern",
        "org": "Secure Dev Labs",
        "points": [
          "Completed 4 practical security assessment tasks across Metasploitable2, DVWA, Windows XP, and a web application target.",
          "Performed reconnaissance, enumeration, vulnerability analysis, and controlled exploitation using Nmap, Nikto, enum4linux, SearchSploit,",
          "Metasploit, SQLmap, SSLyze, shodan and other security tools.",
          "Conducted a 16-step SQL injection assessment against DVWA, testing multiple SQLi techniques and demonstrating database and credential-data exposure."
        ]
      }
    ]
  },
  {
    "id": "assessments",
    "label": "Assessment Work",
    "kind": "assessments",
    "note": "Targets tested, what was in scope, and what it was tested with.",
    "entries": [
      {
        "target": "DVWA — SQL Injection",
        "environment": "Local lab · Docker",
        "period": "2026",
        "summary": "A sixteen-step injection assessment working through multiple SQLi techniques, ending in demonstrated database enumeration and exposure of stored credential data.",
        "scope": [
          "Union-based injection",
          "Error-based injection",
          "Database enumeration",
          "Credential extraction"
        ],
        "tools": [
          "SQLmap",
          "Burp Suite",
          "Manual payloads"
        ],
        "link": null
      },
      {
        "target": "dhamarketplace.com",
        "environment": "Authorised external web target",
        "period": "2026",
        "summary": "External web security assessment covering technology fingerprinting through to transport security review.",
        "scope": [
          "Technology fingerprinting",
          "Reconnaissance",
          "Content discovery",
          "Subdomain enumeration",
          "SSL/TLS review"
        ],
        "tools": [
          "Nmap",
          "Nikto",
          "FFUF",
          "SSLyze",
          "Shodan"
        ],
        "link": null
      },
      {
        "target": "Metasploitable2",
        "environment": "Local lab · isolated network",
        "period": "2026",
        "summary": "Service-level assessment of a deliberately vulnerable host: port and service discovery, version analysis, exploit selection, and controlled exploitation.",
        "scope": [
          "Port & service discovery",
          "Version analysis",
          "Exploit selection",
          "Controlled exploitation"
        ],
        "tools": [
          "Nmap",
          "Metasploit",
          "SearchSploit",
          "enum4linux"
        ],
        "link": null
      },
      {
        "target": "Windows XP host",
        "environment": "Local lab · isolated network",
        "period": "2026",
        "summary": "Legacy Windows assessment covering SMB enumeration and exploitation of unpatched services, documented end to end.",
        "scope": [
          "SMB enumeration",
          "Vulnerability identification",
          "Exploitation",
          "Post-exploitation notes"
        ],
        "tools": [
          "Nmap",
          "enum4linux",
          "Metasploit"
        ],
        "link": null
      },
      {
        "target": "Web application testing practice",
        "environment": "PortSwigger Academy · OWASP Juice Shop",
        "period": "2025 — present",
        "summary": "Ongoing self-directed practice against intentionally vulnerable applications, intercepting and rewriting traffic to probe application logic.",
        "scope": [
          "SQL injection",
          "Cross-site scripting",
          "Authentication flaws",
          "Request tampering"
        ],
        "tools": [
          "Burp Suite",
          "Browser devtools"
        ],
        "link": null
      },
      {
        "target": "TryHackMe rooms",
        "environment": "Guided lab platform",
        "period": "2026 — present",
        "summary": "Guided penetration testing exercises across Linux, networking, and web security, followed from reconnaissance through post-exploitation with technical notes kept per room.",
        "scope": [
          "Linux fundamentals",
          "Networking",
          "Web security",
          "Full methodology"
        ],
        "tools": [
          "Nmap",
          "Burp Suite",
          "Wireshark",
          "Bash"
        ],
        "link": null
      }
    ]
  },
  {
    "id": "education",
    "label": "Education",
    "kind": "register",
    "entries": [
      {
        "period": "2024 — 2029 (expected)",
        "status": "current",
        "title": "BSc, Information Engineering",
        "org": "Arab International University",
        "meta": "CGPA 3.31",
        "points": [
          "Relevant coursework: Operating Systems, Algorithms & Data Structures, Algorithms Analysis & Design, System Analysis and Design, Data Communication, Computer Networks."
        ]
      },
      {
        "period": "Aug 2026 - Feb 2027",
        "status": "current",
        "title": "Cybersecurity Training Program",
        "org": "TECH50K",
        "meta": "",
        "points": [
          "Cybersecurity-focused practical training and evaluation program.",
          "Following a progressive learning path from technical fundamentals toward specialized cybersecurity skills."
        ]
      }
    ]
  },
  {
    "id": "certificates",
    "label": "Certificates",
    "kind": "credentials",
    "note": "In-progress are listed openly, with the expected award noted.",
    "entries": [
      {
        "name": "Junior Cybersecurity Analyst",
        "issuer": "Cisco Networking Academy",
        "kindLabel": "Diploma · Career Path",
        "status": "progress",
        "awarded": null,
        "expected": "In progress",
        "link": null,
        "detail": "Career-path diploma covering network defence, threat management, endpoint security, and security operations fundamentals.",
        "modules": [
          "Introduction to Cybersecurity",
          "Networking Basics",
          "Network Defense",
          "Cyber Threat Management",
          "Endpoint Security"
        ]
      },
      {
        "name": "EFSET English Certificate — C1 Advanced",
        "issuer": "EF Standard English Test",
        "kindLabel": "Assessment",
        "status": "done",
        "awarded": "Verified",
        "expected": null,
        "link": "https://cert.efset.org/2EAwbr",
        "detail": "Upper-intermediate to advanced proficiency, independently scored.",
        "modules": []
      }
    ]
  },
  {
    "id": "skills",
    "label": "Skills",
    "kind": "matrix",
    "groups": [
      {
        "label": "Security",
        "items": [
          "Web application testing",
          "Reconnaissance",
          "Enumeration",
          "Vulnerability assessment",
          "Report writing"
        ]
      },
      {
        "label": "Tooling",
        "items": [
          "Burp Suite",
          "Nmap",
          "FFUF",
          "Wireshark",
          "Metasploit",
          "SQLmap",
          "Nikto",
          "Docker",
          "Git & GitHub"
        ]
      },
      {
        "label": "Languages",
        "items": [
          "Bash",
          "Python",
          "C++",
          "JavaScript",
          "HTML/CSS"
        ]
      },
      {
        "label": "Platforms",
        "items": [
          "Linux",
          "Windows"
        ]
      },
      {
        "label": "Spoken",
        "items": [
          "Arabic — native",
          "English — C1"
        ]
      }
    ]
  },
  {
    "id": "contact",
    "label": "Contact",
    "kind": "contact",
    "body": "Open to internships and junior roles in application security, penetration testing, and security operations."
  }
];
