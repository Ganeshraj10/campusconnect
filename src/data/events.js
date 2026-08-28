export const INITIAL_EVENTS = [
  {
    id: "ev-1",
    name: "Code Cortex 2026",
    organizer: "Computer Science Association",
    category: "Technical",
    poster: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    date: "2026-09-15",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    teamSize: "1 - 3 Members",
    description: "An intensive coding challenge and mini-hackathon testing algorithmic problem solving, web development, and system debugging skills across three competitive rounds.",
    venue: "Main Auditorium & CS Lab 3",
    capacity: 120,
    registeredCount: 88,
    availableSeats: 32,
    registrationDeadline: "2026-09-12",
    status: "upcoming",
    rules: [
      "All team members must carry valid college identity cards.",
      "Teams can consist of 1 to 3 members from any branch or year.",
      "Use of external code repositories without attribution is strictly prohibited.",
      "Judges' decisions on code efficiency and originality will be final."
    ]
  },
  {
    id: "ev-2",
    name: "AI Innovation Challenge",
    organizer: "AI & Machine Learning Club",
    category: "Competition",
    poster: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    date: "2026-09-20",
    startTime: "10:00 AM",
    endTime: "04:30 PM",
    teamSize: "2 - 4 Members",
    description: "Build, train, and present practical AI applications that solve everyday campus and community challenges using modern LLMs, computer vision, or predictive analytics.",
    venue: "Seminar Hall B (Block 4)",
    capacity: 80,
    registeredCount: 65,
    availableSeats: 15,
    registrationDeadline: "2026-09-18",
    status: "upcoming",
    rules: [
      "Projects must incorporate an active machine learning model or API.",
      "Working prototype presentation is mandatory in round 2.",
      "Teams get 7 minutes for presentation followed by 3 minutes of Q&A.",
      "Source code must be submitted via a public GitHub repository."
    ]
  },
  {
    id: "ev-3",
    name: "Cyber Security Arena",
    organizer: "InfoSec Student Society",
    category: "Competition",
    poster: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    date: "2026-09-24",
    startTime: "09:30 AM",
    endTime: "03:30 PM",
    teamSize: "Individual / Pairs",
    description: "A jeopardy-style Capture The Flag (CTF) tournament covering web security, network forensics, cryptography, and reverse engineering challenges.",
    venue: "Cyber Security Research Lab (Room 302)",
    capacity: 60,
    registeredCount: 60,
    availableSeats: 0,
    registrationDeadline: "2026-09-22",
    status: "full",
    rules: [
      "Attacking the scoring infrastructure or other contestants will cause immediate disqualification.",
      "Sharing flags or solutions between different teams is forbidden.",
      "Tools like Burp Suite, Wireshark, and Ghidra are permitted on your own laptops.",
      "Scoring is dynamic based on solve time and difficulty."
    ]
  },
  {
    id: "ev-4",
    name: "Robotics Workshop",
    organizer: "Robotics & Automation Society",
    category: "Workshop",
    poster: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    date: "2026-09-28",
    startTime: "10:00 AM",
    endTime: "04:00 PM",
    teamSize: "Individual",
    description: "Hands-on workshop on microcontroller programming (ESP32/Arduino), sensor interfacing, and motor control. Hardware kits will be provided during the session.",
    venue: "Mechatronics Workshop Hall",
    capacity: 75,
    registeredCount: 42,
    availableSeats: 33,
    registrationDeadline: "2026-09-26",
    status: "upcoming",
    rules: [
      "Hardware kits are provided for workshop use and must be returned after the session.",
      "Basic understanding of C/C++ programming is recommended.",
      "Participants will receive an e-certificate upon verified completion of hands-on exercises."
    ]
  },
  {
    id: "ev-5",
    name: "Data Science Sprint",
    organizer: "Data Analytics Club",
    category: "Technical",
    poster: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    date: "2026-10-02",
    startTime: "01:30 PM",
    endTime: "05:30 PM",
    teamSize: "1 - 2 Members",
    description: "An exploratory data analysis sprint where teams analyze uncleaned real-world datasets, generate insightful visualizations, and present data-backed recommendations.",
    venue: "IT Computer Center 1",
    capacity: 50,
    registeredCount: 38,
    availableSeats: 12,
    registrationDeadline: "2026-09-30",
    status: "upcoming",
    rules: [
      "Datasets will be released precisely at 01:30 PM.",
      "Submissions must include a Jupyter Notebook and an executive summary PDF.",
      "Python (Pandas, Matplotlib, Seaborn) or R are the allowed languages."
    ]
  },
  {
    id: "ev-6",
    name: "IoT Buildathon",
    organizer: "Electronics & Communication Forum",
    category: "Competition",
    poster: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    date: "2026-10-06",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    teamSize: "2 - 4 Members",
    description: "Design and build connected Internet of Things hardware prototypes for smart agriculture, campus safety, or energy monitoring.",
    venue: "ECE Project Lab & Incubation Hall",
    capacity: 40,
    registeredCount: 29,
    availableSeats: 11,
    registrationDeadline: "2026-10-04",
    status: "upcoming",
    rules: [
      "Teams must bring their own sensors and development boards.",
      "A working proof-of-concept hardware demonstration is required for evaluation.",
      "Cloud dashboards (MQTT, ThingSpeak, Firebase) will earn extra evaluation points."
    ]
  },
  {
    id: "ev-7",
    name: "Startup Pitch Challenge",
    organizer: "Campus Entrepreneurship Cell",
    category: "Other",
    poster: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    date: "2026-10-10",
    startTime: "10:30 AM",
    endTime: "03:30 PM",
    teamSize: "1 - 3 Members",
    description: "Pitch your tech or social venture ideas to a panel of alumni entrepreneurs and faculty mentors. Receive actionable feedback and incubation guidance.",
    venue: "Management Studies Conference Hall",
    capacity: 60,
    registeredCount: 45,
    availableSeats: 15,
    registrationDeadline: "2026-10-08",
    status: "upcoming",
    rules: [
      "10-slide deck maximum submitted prior to the deadline.",
      "Each team gets 5 minutes to pitch followed by 5 minutes of mentor questions.",
      "Ideas in ideation, prototype, or early traction stage are all welcome."
    ]
  },
  {
    id: "ev-8",
    name: "Design Thinking Workshop",
    organizer: "User Experience Design Guild",
    category: "Workshop",
    poster: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    date: "2026-10-14",
    startTime: "02:00 PM",
    endTime: "05:00 PM",
    teamSize: "Individual",
    description: "Learn human-centered product design principles, empathy mapping, user journey creation, and rapid Figma wireframing in this interactive hands-on workshop.",
    venue: "Design Studio (Architecture Block Room 101)",
    capacity: 45,
    registeredCount: 45,
    availableSeats: 0,
    registrationDeadline: "2026-10-11",
    status: "closed",
    rules: [
      "Bring a laptop with a free Figma account pre-configured.",
      "Active participation in group empathy exercises is expected.",
      "Templates and design system UI kits will be shared digitally."
    ]
  },
  {
    id: "ev-9",
    name: "Technical Treasure Hunt",
    organizer: "ISTE Student Chapter",
    category: "Cultural",
    poster: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    date: "2026-10-18",
    startTime: "10:00 AM",
    endTime: "02:00 PM",
    teamSize: "3 - 4 Members",
    description: "An exhilarating campus-wide quest combining logic puzzles, cipher deciphering, QR code checkpoints, and rapid technical riddles.",
    venue: "College Central Courtyard (Starting Point)",
    capacity: 100,
    registeredCount: 72,
    availableSeats: 28,
    registrationDeadline: "2026-10-16",
    status: "upcoming",
    rules: [
      "All team members must stay together during the hunt.",
      "Running inside academic hallways and laboratories is prohibited.",
      "The first team to unlock the final vault code at the control desk wins."
    ]
  },
  {
    id: "ev-10",
    name: "Green Tech Challenge",
    organizer: "Eco & Sustainability Club",
    category: "Competition",
    poster: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
    date: "2026-10-22",
    startTime: "09:30 AM",
    endTime: "04:00 PM",
    teamSize: "2 - 3 Members",
    description: "Showcase innovative engineering solutions focused on renewable energy, e-waste recycling, water conservation, and campus carbon reduction.",
    venue: "Green Energy Technology Center",
    capacity: 50,
    registeredCount: 22,
    availableSeats: 28,
    registrationDeadline: "2026-10-19",
    status: "upcoming",
    rules: [
      "Hardware or simulation model demonstrations are both eligible.",
      "Projects will be judged on environmental impact, feasibility, and cost effectiveness.",
      "Poster summary of the project must accompany the presentation."
    ]
  }
];

export const CATEGORIES = [
  "All",
  "Technical",
  "Workshop",
  "Competition",
  "Cultural",
  "Sports",
  "Other"
];

export const SAMPLE_POSTERS = [
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
];
