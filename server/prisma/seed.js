const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CampusConnect database...");

  // Clean existing records in reverse dependency order
  await prisma.attendance.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Demo Users
  const student = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex.j@college.edu",
      password: hashedPassword,
      registerNumber: "2023CSE042",
      phone: "9876543210",
      department: "Computer Science & Engineering",
      year: "3rd Year",
      role: "STUDENT"
    }
  });

  const organizer = await prisma.user.create({
    data: {
      name: "Prof. Rajesh Kumar",
      email: "rajesh.k@college.edu",
      password: hashedPassword,
      department: "Tech Club Coordinator / CSE Faculty",
      phone: "9876543220",
      role: "ORGANIZER"
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: "Dr. Anita Sharma",
      email: "dean.events@college.edu",
      password: hashedPassword,
      department: "Dean of Student Affairs",
      phone: "9876543230",
      role: "ADMIN"
    }
  });

  console.log("✅ Users created: Student, Organizer, Admin (password: password123)");

  // 2. Create 10 Realistic College Events
  const eventsData = [
    {
      name: "Code Cortex 2026",
      description: "An intensive coding challenge and mini-hackathon testing algorithmic problem solving, web development, and system debugging skills across three competitive rounds.",
      category: "Technical",
      posterKey: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      date: "2026-09-15",
      startTime: "09:00 AM",
      endTime: "05:00 PM",
      venue: "Main Auditorium & CS Lab 3",
      teamSize: "1 - 3 Members",
      capacity: 120,
      registeredCount: 88,
      registrationDeadline: "2026-09-12",
      status: "UPCOMING",
      rules: [
        "All team members must carry valid college identity cards.",
        "Teams can consist of 1 to 3 members from any branch or year.",
        "Use of external code repositories without attribution is strictly prohibited.",
        "Judges' decisions on code efficiency and originality will be final."
      ]
    },
    {
      name: "AI Innovation Challenge",
      description: "Build, train, and present practical AI applications that solve everyday campus and community challenges using modern LLMs, computer vision, or predictive analytics.",
      category: "Competition",
      posterKey: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
      date: "2026-09-20",
      startTime: "10:00 AM",
      endTime: "04:30 PM",
      venue: "Seminar Hall B (Block 4)",
      teamSize: "2 - 4 Members",
      capacity: 80,
      registeredCount: 65,
      registrationDeadline: "2026-09-18",
      status: "UPCOMING",
      rules: [
        "Projects must incorporate an active machine learning model or API.",
        "Working prototype presentation is mandatory in round 2.",
        "Teams get 7 minutes for presentation followed by 3 minutes of Q&A.",
        "Source code must be submitted via a public GitHub repository."
      ]
    },
    {
      name: "Cyber Security Arena",
      description: "A jeopardy-style Capture The Flag (CTF) tournament covering web security, network forensics, cryptography, and reverse engineering challenges.",
      category: "Competition",
      posterKey: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
      date: "2026-09-24",
      startTime: "09:30 AM",
      endTime: "03:30 PM",
      venue: "Cyber Security Research Lab (Room 302)",
      teamSize: "Individual / Pairs",
      capacity: 60,
      registeredCount: 60,
      registrationDeadline: "2026-09-22",
      status: "FULL",
      rules: [
        "Attacking the scoring infrastructure or other contestants will cause immediate disqualification.",
        "Sharing flags or solutions between different teams is forbidden.",
        "Tools like Burp Suite, Wireshark, and Ghidra are permitted on your own laptops."
      ]
    },
    {
      name: "Robotics Workshop",
      description: "Hands-on workshop on microcontroller programming (ESP32/Arduino), sensor interfacing, and motor control. Hardware kits will be provided during the session.",
      category: "Workshop",
      posterKey: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
      date: "2026-09-28",
      startTime: "10:00 AM",
      endTime: "04:00 PM",
      venue: "Mechatronics Workshop Hall",
      teamSize: "Individual",
      capacity: 75,
      registeredCount: 42,
      registrationDeadline: "2026-09-26",
      status: "UPCOMING",
      rules: [
        "Hardware kits are provided for workshop use and must be returned after the session.",
        "Basic understanding of C/C++ programming is recommended.",
        "Participants will receive an e-certificate upon verified completion of hands-on exercises."
      ]
    },
    {
      name: "Data Science Sprint",
      description: "An exploratory data analysis sprint where teams analyze uncleaned real-world datasets, generate insightful visualizations, and present data-backed recommendations.",
      category: "Technical",
      posterKey: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      date: "2026-10-02",
      startTime: "01:30 PM",
      endTime: "05:30 PM",
      venue: "IT Computer Center 1",
      teamSize: "1 - 2 Members",
      capacity: 50,
      registeredCount: 38,
      registrationDeadline: "2026-09-30",
      status: "UPCOMING",
      rules: [
        "Datasets will be released precisely at 01:30 PM.",
        "Submissions must include a Jupyter Notebook and an executive summary PDF."
      ]
    },
    {
      name: "IoT Buildathon",
      description: "Design and build connected Internet of Things hardware prototypes for smart agriculture, campus safety, or energy monitoring.",
      category: "Competition",
      posterKey: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      date: "2026-10-06",
      startTime: "09:00 AM",
      endTime: "05:00 PM",
      venue: "ECE Project Lab & Incubation Hall",
      teamSize: "2 - 4 Members",
      capacity: 40,
      registeredCount: 29,
      registrationDeadline: "2026-10-04",
      status: "UPCOMING",
      rules: [
        "Teams must bring their own sensors and development boards.",
        "A working proof-of-concept hardware demonstration is required for evaluation."
      ]
    },
    {
      name: "Startup Pitch Challenge",
      description: "Pitch your tech or social venture ideas to a panel of alumni entrepreneurs and faculty mentors. Receive actionable feedback and incubation guidance.",
      category: "Other",
      posterKey: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
      date: "2026-10-10",
      startTime: "10:30 AM",
      endTime: "03:30 PM",
      venue: "Management Studies Conference Hall",
      teamSize: "1 - 3 Members",
      capacity: 60,
      registeredCount: 45,
      registrationDeadline: "2026-10-08",
      status: "UPCOMING",
      rules: [
        "10-slide deck maximum submitted prior to the deadline.",
        "Each team gets 5 minutes to pitch followed by 5 minutes of mentor questions."
      ]
    },
    {
      name: "Design Thinking Workshop",
      description: "Learn human-centered product design principles, empathy mapping, user journey creation, and rapid Figma wireframing in this interactive hands-on workshop.",
      category: "Workshop",
      posterKey: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
      date: "2026-10-14",
      startTime: "02:00 PM",
      endTime: "05:00 PM",
      venue: "Design Studio (Architecture Block Room 101)",
      teamSize: "Individual",
      capacity: 45,
      registeredCount: 45,
      registrationDeadline: "2026-10-11",
      status: "CLOSED",
      rules: [
        "Bring a laptop with a free Figma account pre-configured.",
        "Active participation in group empathy exercises is expected."
      ]
    },
    {
      name: "Technical Treasure Hunt",
      description: "An exhilarating campus-wide quest combining logic puzzles, cipher deciphering, QR code checkpoints, and rapid technical riddles.",
      category: "Cultural",
      posterKey: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
      date: "2026-10-18",
      startTime: "10:00 AM",
      endTime: "02:00 PM",
      venue: "College Central Courtyard (Starting Point)",
      teamSize: "3 - 4 Members",
      capacity: 100,
      registeredCount: 72,
      registrationDeadline: "2026-10-16",
      status: "UPCOMING",
      rules: [
        "All team members must stay together during the hunt.",
        "Running inside academic hallways and laboratories is prohibited."
      ]
    },
    {
      name: "Green Tech Challenge",
      description: "Showcase innovative engineering solutions focused on renewable energy, e-waste recycling, water conservation, and campus carbon reduction.",
      category: "Competition",
      posterKey: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
      date: "2026-10-22",
      startTime: "09:30 AM",
      endTime: "04:00 PM",
      venue: "Green Energy Technology Center",
      teamSize: "2 - 3 Members",
      capacity: 50,
      registeredCount: 22,
      registrationDeadline: "2026-10-19",
      status: "UPCOMING",
      rules: [
        "Hardware or simulation model demonstrations are both eligible.",
        "Projects will be judged on environmental impact, feasibility, and cost effectiveness."
      ]
    }
  ];

  const createdEvents = [];
  for (const ev of eventsData) {
    const created = await prisma.event.create({
      data: {
        ...ev,
        organizerId: organizer.id
      }
    });
    createdEvents.push(created);
  }

  console.log(`✅ ${createdEvents.length} events created`);

  // 3. Create Sample Registration for Student
  const reg1 = await prisma.registration.create({
    data: {
      userId: student.id,
      eventId: createdEvents[0].id, // Code Cortex
      teamName: "CodeCrafters",
      teamMembers: "Alex Johnson, Ryan Davis, Priya Sharma",
      status: "CONFIRMED"
    }
  });

  // Create attendance record
  await prisma.attendance.create({
    data: {
      registrationId: reg1.id,
      attended: false
    }
  });

  // Create Notification
  await prisma.notification.create({
    data: {
      userId: student.id,
      eventId: createdEvents[0].id,
      title: "Registration Confirmed",
      message: `You are confirmed for ${createdEvents[0].name} on ${createdEvents[0].date}. Pass ID: ${reg1.id}`
    }
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
