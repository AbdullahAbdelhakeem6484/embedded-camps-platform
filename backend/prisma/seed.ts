import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface SessionMaterial {
  title: string;
  type: string;
  url: string;
}

interface SessionLab {
  title: string;
  description?: string;
}

interface QuizQuestion {
  text: string;
  options: string[];
  correctOption: number;
}

interface SessionData {
  title: string;
  description?: string;
  category: string;
  materials?: SessionMaterial[];
  labs?: SessionLab[];
  quizQuestions?: QuizQuestion[];
}

async function main() {
  console.log('Starting database seeding with quizzes for all courses...');

  // 1. Clean existing records in dependency order
  await prisma.materialProgress.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.labSubmission.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.material.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.campSession.deleteMany();
  await prisma.masterSession.deleteMany();
  await prisma.camp.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleaned successfully.');

  // 2. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('engineer123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@embeddedcamps.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'engineer@embeddedcamps.com',
      password: studentPassword,
      name: 'John Doe (AOSP Engineer)',
      role: 'STUDENT',
    },
  });

  console.log('Seeded users:', { admin: admin.email, student: student.email });

  // 3. Create Camps (Cohorts)
  const activeCamp = await prisma.camp.create({
    data: {
      title: 'AOSPCamp - July 2026 Cohort',
      description: 'The complete AOSP & Embedded Android Bootcamp program starting July 2026. Weekly modules covering Fundamentals, Internals, Debugging, Security, and System Design.',
      price: 100.00,
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-08-15'),
      status: 'ACTIVE',
    },
  });

  const upcomingCamp = await prisma.camp.create({
    data: {
      title: 'AOSPCamp - September 2026 Cohort',
      description: 'The complete AOSP & Embedded Android Bootcamp program starting September 2026.',
      price: 100.00,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-10-15'),
      status: 'UPCOMING',
    },
  });

  const expiredCamp = await prisma.camp.create({
    data: {
      title: 'AOSPCamp - May 2025 Cohort',
      description: 'The complete AOSP & Embedded Android Bootcamp program starting May 2025.',
      price: 100.00,
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-06-15'),
      status: 'COMPLETED',
    },
  });

  console.log('Seeded Camps (Cohorts):', { active: activeCamp.title, upcoming: upcomingCamp.title, expired: expiredCamp.title });

  // Enroll student in the active July cohort with 1-year expiration
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      campId: activeCamp.id,
      expiresAt: new Date('2027-07-01'),
    },
  });
  console.log(`Enrolled student ${student.email} in ${activeCamp.title}`);

  // Enroll student in the expired cohort (expired 1 year ago)
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      campId: expiredCamp.id,
      expiresAt: new Date('2026-05-01'),
    },
  });

  // Grant certificate for the expired cohort
  const expiredCert = await prisma.certificate.create({
    data: {
      userId: student.id,
      campId: expiredCamp.id,
    }
  });

  console.log('Seeded expired camp enrollment and certificate:', { expiredCamp: expiredCamp.title, certId: expiredCert.id });

  // 4. Define Sessions (Generic reusable modules across all courses)
  const sessionsToSeed: SessionData[] = [
    // --- COURSE 1: AOSP FUNDAMENTALS ---
    {
      title: 'C1-M1: Introduction to AOSP',
      description: 'Overview of open-source licensing, AOSP vs GMS Android split, and embedded system applications.',
      category: 'Course 1: Fundamentals',
      materials: [
        { title: 'Intro to AOSP Lecture Video', type: 'VIDEO', url: 'https://bunny.net/aosp-intro.mp4' },
        { title: 'Module 1 Presentation Slide Deck', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/module1-slides.pdf' }
      ],
      labs: [
        { title: 'Lab 1.1: Environment Setup & Dependencies', description: 'Configure an Ubuntu 22.04 LTS host, install compilers, Git, and Java 17 for AOSP compilation.' }
      ]
    },
    {
      title: 'C1-M2: AOSP Architecture Layers',
      description: 'Deep dive into the 5 layers: Kernel, HAL, Runtime & Native, Application Framework, and Apps.',
      category: 'Course 1: Fundamentals',
      materials: [
        { title: 'AOSP Architecture Lecture Video', type: 'VIDEO', url: 'https://bunny.net/aosp-architecture.mp4' }
      ],
      labs: [
        { title: 'Lab 1.4: Source Exploration', description: 'Navigate and explore the tree structures of framework services, native libs, and hardware layers.' }
      ]
    },
    {
      title: 'C1-M3: AOSP Source Code Structure',
      description: 'Map directories of the source tree, understand key folders like frameworks, system, hardware, and device.',
      category: 'Course 1: Fundamentals',
      materials: [
        { title: 'Source Directory Structure Video', type: 'VIDEO', url: 'https://bunny.net/aosp-source-tree.mp4' }
      ],
      labs: [
        { title: 'Lab 1.2: AOSP Source Download', description: 'Initialize the repo client tool and fetch the full source code branch of Android 15.' }
      ]
    },
    {
      title: 'C1-M4: Repo Tool & Source Management',
      description: 'Learn Git-based multi-repository coordination, manifest files, and Gerrit contribution cycles.',
      category: 'Course 1: Fundamentals',
      materials: [
        { title: 'Repo Command-Line Tools Video', type: 'VIDEO', url: 'https://bunny.net/aosp-repo-tools.mp4' }
      ],
      labs: [
        { title: 'Lab 1.3: Building AOSP from Source', description: 'Source envsetup.sh, choose a target with lunch, and compile your first image using Soong.' }
      ]
    },
    {
      title: 'C1-M5: Build System Fundamentals',
      description: 'Explore Make, Soong, and Bazel evolution. Contrast eng, userdebug, and user build variants.',
      category: 'Course 1: Fundamentals',
      materials: [
        { title: 'Soong & Blueprint Builds Video', type: 'VIDEO', url: 'https://bunny.net/aosp-build-system.mp4' }
      ],
      labs: [
        { title: 'Lab 1.5: Build Variants & Modules', description: 'Recompile custom modules (e.g. Settings app), and flash them using eng and userdebug variants.' }
      ],
      quizQuestions: [
        {
          text: 'What is the primary difference between AOSP and Android?',
          options: [
            'AOSP is for phones, Android is for tablets',
            'AOSP is open-source, Android includes proprietary Google services',
            'AOSP is older, Android is the new version',
            'There is no difference, they are the same thing'
          ],
          correctOption: 1
        },
        {
          text: 'Which of the following is NOT a typical use case for AOSP?',
          options: [
            'Automotive infotainment systems',
            'Smart home displays',
            'Standard consumer smartphones with Play Store',
            'Industrial control panels'
          ],
          correctOption: 2
        },
        {
          text: 'Does pure AOSP require licensing fees or agreements from Google?',
          options: [
            'Yes, all builds require Google approval',
            'Only if compiled on Ubuntu hosts',
            'No, it is free under Apache 2.0 and GPL v2 licenses',
            'Yes, $5 per device'
          ],
          correctOption: 2
        },
        {
          text: 'Select three industries where AOSP is commonly used for embedded applications.',
          options: [
            'Automotive, IoT, Medical',
            'Aerospace, Gaming, Web Search',
            'Social Media, E-commerce, Finance',
            'None of the above'
          ],
          correctOption: 0
        },
        {
          text: 'What is the estimated salary range for a mid-level AOSP/Platform Engineer?',
          options: [
            '$50,000 - $70,000',
            '$80,000 - $100,000',
            '$100,000 - $140,000',
            '$200,000+'
          ],
          correctOption: 2
        },
        {
          text: 'Which layer in the AOSP architecture provides hardware abstraction?',
          options: [
            'Linux Kernel',
            'Application Framework',
            'Hardware Abstraction Layer (HAL)',
            'Android Runtime (ART)'
          ],
          correctOption: 2
        },
        {
          text: 'What is Binder in the context of AOSP?',
          options: [
            'A tool for binding apps together',
            'Android\'s primary inter-process communication (IPC) mechanism',
            'A library for UI binding',
            'A build system component'
          ],
          correctOption: 1
        },
        {
          text: 'Which of the following describes the correct mapping of components to their AOSP layers?',
          options: [
            'Kernel: Camera Driver, HAL: Audio HAL, ART: libc, Framework: SystemServer',
            'Kernel: Audio HAL, HAL: Driver, ART: SystemServer, Framework: libc',
            'Kernel: libc, HAL: SystemServer, ART: Audio HAL, Framework: Driver',
            'None of the above'
          ],
          correctOption: 0
        },
        {
          text: 'True or False: ART (Android Runtime) replaced Dalvik VM starting from Android 5.0.',
          options: ['True', 'False'],
          correctOption: 0
        },
        {
          text: 'Why does AOSP use the repo tool instead of just Git?',
          options: [
            'Git is too slow for large projects',
            'AOSP consists of 1000+ separate Git repositories that need synchronized management',
            'Repo is faster than Git',
            'Google doesn\'t like Git'
          ],
          correctOption: 1
        },
        {
          text: 'What is the purpose of the manifest file in repo?',
          options: [
            'To define Git repositories, paths, and revisions to download',
            'To configure compiler optimization flags',
            'To document API interfaces',
            'To sign releases'
          ],
          correctOption: 0
        },
        {
          text: 'What is the purpose of the `lunch` command in AOSP?',
          options: [
            'To start the build process',
            'To select the build target and variant',
            'To download source code',
            'To launch the emulator'
          ],
          correctOption: 1
        },
        {
          text: 'Which build variant is recommended for development and testing?',
          options: ['eng', 'userdebug', 'user', 'debug'],
          correctOption: 1
        },
        {
          text: 'You run `m -j32` to build AOSP, but your build fails with "Out of memory" errors. What should you do?',
          options: [
            'Download more RAM',
            'Reduce parallelism with -j4 or -j8',
            'Delete the source code and re-download',
            'Use a different build command'
          ],
          correctOption: 1
        },
        {
          text: 'How much disk space is typically required for a full AOSP build (source + build output)?',
          options: ['10-20 GB', '50-75 GB', '200-300 GB', '500+ GB'],
          correctOption: 2
        }
      ]
    },

    // --- COURSE 2: AOSP INTERNALS ---
    {
      title: 'C2-M1: Android Boot Flow',
      description: 'Boot sequence from bootloader loading kernel to launcher app initialization.',
      category: 'Course 2: Internals',
      labs: [{ title: 'Lab 2.1: Boot Flow Tracing', description: 'Trace and parse android kernel logs and system boot milestones.' }]
    },
    {
      title: 'C2-M2: Init System & RC Files',
      description: 'How init parses configuration files to launch services, setup properties, and mount partitions.',
      category: 'Course 2: Internals',
      labs: [{ title: 'Lab 2.2: Creating Init Services', description: 'Add a custom daemon initialized via init.rc scripts.' }]
    },
    {
      title: 'C2-M3: Binder IPC Mechanism',
      description: 'Kernel-level IPC communication, transactions, UIDs, and AIDL interface design.',
      category: 'Course 2: Internals',
      labs: [{ title: 'Lab 2.3: Binder Communication Analysis', description: 'Analyze inter-process binder transaction packages.' }]
    },
    {
      title: 'C2-M4: System Services Architecture',
      description: 'SystemServer lifecycle, Binder bindings, and adding your own system-wide Java service.',
      category: 'Course 2: Internals',
      labs: [{ title: 'Lab 2.4: Custom System Service', description: 'Create and bind a custom framework service with AIDL.' }]
    },
    {
      title: 'C2-M5: Package Management',
      description: 'APK structure, PackageManagerService, parsing package manifests, and signature checking.',
      category: 'Course 2: Internals',
      labs: [{ title: 'Lab 2.5: Package Installation Flow', description: 'Debug package parser and check installation logs.' }]
    },
    {
      title: 'C2-M6: Zygote & App Lifecycle',
      description: 'Forking processes, pre-loaded classes, activity lifecycle transitions, and memory optimizations.',
      category: 'Course 2: Internals',
      labs: [{ title: 'Lab 2.6: App Launch Profiling', description: 'Measure and optimize application launch performance.' }],
      quizQuestions: [
        {
          text: 'What is the first userspace process in Android?',
          options: ['Zygote', 'SystemServer', 'Init', 'Kernel'],
          correctOption: 2
        },
        {
          text: 'What does Zygote preload during startup?',
          options: ['Only Java classes', 'Only resources', 'Classes and resources', 'Nothing, it is empty'],
          correctOption: 2
        },
        {
          text: 'Which file format is used for init configuration?',
          options: ['.xml', '.rc', '.conf', '.ini'],
          correctOption: 1
        },
        {
          text: 'What is the primary purpose of Binder?',
          options: ['Bind apps together', 'Inter-process communication', 'Bind UI elements', 'Network communication'],
          correctOption: 1
        },
        {
          text: 'Where does SystemServer run?',
          options: ['In kernel space', 'In its own process', 'In Zygote process', 'In init process'],
          correctOption: 1
        },
        {
          text: 'What property indicates boot completion?',
          options: ['ro.boot.complete', 'sys.boot_completed', 'init.boot.done', 'android.boot.ready'],
          correctOption: 1
        },
        {
          text: 'What does AIDL stand for?',
          options: ['Android Interface Definition Language', 'Android Internal Data Layer', 'Application Interface Design Language', 'Android IPC Definition Library'],
          correctOption: 0
        },
        {
          text: 'Which service class starts first?',
          options: ['main', 'late_start', 'core', 'hal'],
          correctOption: 2
        },
        {
          text: 'What is the Binder transaction size limit?',
          options: ['100KB', '1MB', '10MB', 'Unlimited'],
          correctOption: 1
        },
        {
          text: 'Where are system services registered?',
          options: ['ActivityManager', 'PackageManager', 'ServiceManager', 'WindowManager'],
          correctOption: 2
        },
        {
          text: 'What triggers init actions?',
          options: ['Time-based schedules', 'Property changes and boot events', 'User input', 'Network events'],
          correctOption: 1
        },
        {
          text: 'Which process template creates app processes?',
          options: ['Init', 'SystemServer', 'Zygote', 'Launcher'],
          correctOption: 2
        },
        {
          text: 'What does APK stand for?',
          options: ['Android Package Kit', 'Application Package', 'Android Program Kit', 'Application Package Kit'],
          correctOption: 0
        },
        {
          text: 'Where is the packages database stored?',
          options: ['/data/system/packages.xml', '/system/packages.db', '/data/packages.xml', '/system/etc/packages.xml'],
          correctOption: 0
        },
        {
          text: 'What happens when a service crashes with "critical" flag?',
          options: ['Service restarts', 'System reboots', 'Nothing', 'Logs error only'],
          correctOption: 1
        }
      ]
    },

    // --- COURSE 3: DEBUGGING & TRACING ---
    {
      title: 'C3-M1: Advanced ADB Usage',
      category: 'Course 3: Debugging',
      labs: [{ title: 'Lab 3.1: Advanced ADB Techniques', description: 'ADB forwarding, reverse connections, and low-level debugging.' }]
    },
    {
      title: 'C3-M2: Logcat & Log Analysis',
      category: 'Course 3: Debugging',
      labs: [{ title: 'Lab 3.2: Log Filtering & Analysis', description: 'Write script pipelines to parse and alert system issues.' }]
    },
    {
      title: 'C3-M3: Native Debugging (gdb, lldb)',
      category: 'Course 3: Debugging',
      labs: [{ title: 'Lab 3.3: Debugging Native Crashes', description: 'Generate and analyze native coredumps.' }]
    },
    {
      title: 'C3-M4: System Tracing (systrace, perfetto)',
      category: 'Course 3: Debugging',
      labs: [{ title: 'Lab 3.4: Performance Profiling with Perfetto', description: 'Capture trace files and evaluate scheduling latency.' }]
    },
    {
      title: 'C3-M5: Memory Analysis & Profiling',
      category: 'Course 3: Debugging',
      labs: [{ title: 'Lab 3.5: Memory Leak Detection', description: 'Detect memory leaks using malloc debug and sanitizer utilities.' }],
      quizQuestions: [
        {
          text: 'What is the default ADB port?',
          options: ['5037', '5555', '8080', '3000'],
          correctOption: 0
        },
        {
          text: 'Which logcat buffer contains crash logs?',
          options: ['main', 'system', 'crash', 'events'],
          correctOption: 2
        },
        {
          text: 'What tool analyzes tombstones?',
          options: ['gdb', 'stack', 'addr2line', 'objdump'],
          correctOption: 1
        },
        {
          text: 'What replaced systrace?',
          options: ['Simpleperf', 'Perfetto', 'Traceview', 'Profiler'],
          correctOption: 1
        },
        {
          text: 'Where are tombstones stored?',
          options: ['/data/tombstones/', '/system/tombstones/', '/cache/tombstones/', '/tmp/tombstones/'],
          correctOption: 0
        },
        {
          text: 'What format is heap dump?',
          options: ['.txt', '.hprof', '.bin', '.dump'],
          correctOption: 1
        },
        {
          text: 'Which command enables network ADB?',
          options: ['adb network', 'adb tcpip 5555', 'adb wifi', 'adb remote'],
          correctOption: 1
        },
        {
          text: 'What does ANR stand for?',
          options: ['Android Not Responding', 'Application Not Running', 'App Network Request', 'Android Native Runtime'],
          correctOption: 0
        },
        {
          text: 'Which log level is most verbose?',
          options: ['D (Debug)', 'V (Verbose)', 'I (Info)', 'W (Warning)'],
          correctOption: 1
        },
        {
          text: 'What analyzes native crashes?',
          options: ['Java debugger', 'GDB/LLDB', 'Logcat', 'ADB'],
          correctOption: 1
        },
        {
          text: 'What is jank?',
          options: ['Memory leak', 'Frame drops', 'Crash', 'ANR'],
          correctOption: 1
        },
        {
          text: 'Which tool profiles CPU?',
          options: ['Simpleperf', 'Logcat', 'ADB', 'Dumpsys'],
          correctOption: 0
        },
        {
          text: 'What is the frame time target?',
          options: ['8ms', '16ms', '32ms', '60ms'],
          correctOption: 1
        },
        {
          text: 'Where are ANR traces?',
          options: ['/data/anr/', '/system/anr/', '/cache/anr/', '/tmp/anr/'],
          correctOption: 0
        },
        {
          text: 'What is overdraw?',
          options: ['Drawing too fast', 'Drawing same pixel multiple times', 'Drawing outside bounds', 'Drawing with wrong color'],
          correctOption: 1
        }
      ]
    },

    // --- COURSE 4: SECURITY, BOOT & OTA ---
    {
      title: 'C4-M1: Android Security Model',
      category: 'Course 4: Security',
      labs: [{ title: 'Lab 4.1: Security Model Check', description: 'Evaluate app permissions and user separation.' }]
    },
    {
      title: 'C4-M2: SELinux in Android',
      category: 'Course 4: Security',
      labs: [{ title: 'Lab 4.2: SELinux Policy Creation', description: 'Define policies for custom native daemons.' }]
    },
    {
      title: 'C4-M3: Verified Boot (AVB)',
      category: 'Course 4: Security',
      labs: [{ title: 'Lab 4.3: Verified Boot Configuration', description: 'Secure device boot chain with public keys.' }]
    },
    {
      title: 'C4-M4: OTA Update Mechanisms',
      category: 'Course 4: Security',
      labs: [{ title: 'Lab 4.4: OTA Package Creation', description: 'Build signable full and incremental OTA update files.' }]
    },
    {
      title: 'C4-M5: A/B Seamless Updates',
      category: 'Course 4: Security',
      labs: [{ title: 'Lab 4.5: A/B Update Implementation', description: 'Simulate background seamless partition updates.' }],
      quizQuestions: [
        {
          text: 'What is the main purpose of SELinux in Android?',
          options: [
            'To improve graphics rendering speed',
            'To enforce mandatory access control (MAC) and sandbox processes',
            'To manage battery levels',
            'To compile Java applications'
          ],
          correctOption: 1
        },
        {
          text: 'In SELinux, what is the default mode on user/production builds?',
          options: ['Permissive', 'Disabled', 'Enforcing', 'Audit'],
          correctOption: 2
        },
        {
          text: 'What does AVB stand for in the context of secure booting?',
          options: ['Android Verified Boot', 'Android Virtual Binder', 'Audio Video Bridge', 'Advanced Vector Boot'],
          correctOption: 0
        },
        {
          text: 'What partition stores boot key hashes for verification?',
          options: ['system', 'vbmeta', 'userdata', 'cache'],
          correctOption: 1
        },
        {
          text: 'In A/B update systems, how many bootable partition slots exist?',
          options: ['One', 'Two (Slot A and Slot B)', 'Three', 'Four'],
          correctOption: 1
        }
      ]
    },

    // --- COURSE 5: SYSTEM DESIGN & ARCHITECTURE ---
    {
      title: 'C5-M1: Requirements Analysis',
      category: 'Course 5: Design',
      labs: [{ title: 'Lab 5.1: Requirements Specification', description: 'Define embedded hardware and layout demands.' }]
    },
    {
      title: 'C5-M2: Architecture Patterns',
      category: 'Course 5: Design',
      labs: [{ title: 'Lab 5.2: Architecture Design', description: 'Map modular system-level component relationships.' }]
    },
    {
      title: 'C5-M3: HAL Design & Implementation',
      category: 'Course 5: Design',
      labs: [{ title: 'Lab 5.3: Custom HAL Implementation', description: 'Write an AIDL-based custom hardware abstraction interface.' }]
    },
    {
      title: 'C5-M4: System Integration',
      category: 'Course 5: Design',
      labs: [{ title: 'Lab 5.4: Integration Testing', description: 'Deploy and test hardware components together.' }]
    },
    {
      title: 'C5-M5: Performance Optimization',
      category: 'Course 5: Design',
      labs: [{ title: 'Lab 5.5: Performance Optimization Tuning', description: 'Tune CPU frequencies and compile features to accelerate boot.' }],
      quizQuestions: [
        {
          text: 'What is the primary function of the Vehicle HAL (VHAL) in Android Automotive?',
          options: [
            'To stream audio files to speakers',
            'To interface the Android framework with the vehicle CAN/LIN networks',
            'To display Google Maps',
            'To manage user logins'
          ],
          correctOption: 1
        },
        {
          text: 'Which communication interface is used for modern AIDL HALs?',
          options: ['Unix sockets', 'Binder IPC', 'Shared memory', 'Local files'],
          correctOption: 1
        },
        {
          text: 'What does Treble separate in Android\'s architecture?',
          options: [
            'The kernel from the CPU',
            'The Android framework from the vendor HALs',
            'System apps from user apps',
            'Java framework from C++ runtime'
          ],
          correctOption: 1
        },
        {
          text: 'How can an engineer add a custom system service to AOSP?',
          options: [
            'Register it in ServiceManager within SystemServer',
            'Add it to the settings app',
            'Write a new Linux driver',
            'Compile it inside an application package'
          ],
          correctOption: 0
        },
        {
          text: 'What is the primary target file when writing a product definition?',
          options: ['Android.bp', 'BoardConfig.mk', 'device.mk', 'init.rc'],
          correctOption: 2
        }
      ]
    },

    // --- COURSE 6: GRADUATION PROJECT ---
    {
      title: 'C6-T1: In-Vehicle Infotainment (IVI) System',
      description: 'Build a custom automotive infotainment system with Vehicle HAL integration, custom launcher, and multi-display routing.',
      category: 'Course 6: Graduation Project',
      materials: [
        { title: 'IVI System Track Overview Video', type: 'VIDEO', url: 'https://bunny.net/ivi-overview.mp4' },
        { title: 'IVI Design Specifications PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/ivi-spec.pdf' }
      ],
      labs: [
        { title: 'Project Deliverable: IVI System & Vehicle HAL Code', description: 'Implement your custom automotive launcher and Vehicle HAL AIDL implementation.' }
      ]
    },
    {
      title: 'C6-T2: Smart Navigation System',
      description: 'Build an integrated navigation and mapping system using OpenStreetMap rendering and GPS HAL interfaces.',
      category: 'Course 6: Graduation Project',
      materials: [
        { title: 'Smart Navigation Overview Video', type: 'VIDEO', url: 'https://bunny.net/nav-overview.mp4' },
        { title: 'OSM and GPS HAL Integration PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/nav-integration.pdf' }
      ],
      labs: [
        { title: 'Project Deliverable: Mapping & GPS Integration Code', description: 'Integrate GPS hardware/simulated data and build routing engine on OpenStreetMap.' }
      ]
    },
    {
      title: 'C6-T3: Media & Entertainment System',
      description: 'Build a multi-source media player supporting Bluetooth audio, USB media, and multi-zone audio routing HALs.',
      category: 'Course 6: Graduation Project',
      materials: [
        { title: 'Audio HAL and Multi-Zone Audio Video', type: 'VIDEO', url: 'https://bunny.net/media-overview.mp4' },
        { title: 'Media Database & HAL Specs PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/media-specs.pdf' }
      ],
      labs: [
        { title: 'Project Deliverable: Media System & Bluetooth Audio HAL', description: 'Submit media player service, Bluetooth HAL integration, and USB media detection daemon.' }
      ]
    },
    {
      title: 'C6-T4: AI/ML Integration Platform',
      description: 'Build an AI-powered embedded platform integrating TensorFlow Lite, camera object detection, and voice control.',
      category: 'Course 6: Graduation Project',
      materials: [
        { title: 'TFLite & Camera HAL Pipeline Video', type: 'VIDEO', url: 'https://bunny.net/ai-ml-overview.mp4' },
        { title: 'TFLite Inference Optimization PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/ai-ml-optimization.pdf' }
      ],
      labs: [
        { title: 'Project Deliverable: AI Application & Model Pipeline', description: 'Deploy TensorFlow Lite model and integrate with Camera/Audio HAL for real-time inference.' }
      ]
    },
    {
      title: 'C6-T5: Secure Embedded System',
      description: 'Build a secure, locked-down device utilizing file-based encryption (FBE), custom Keystore, and biometric HALs.',
      category: 'Course 6: Graduation Project',
      materials: [
        { title: 'FBE and Biometric HAL Architecture Video', type: 'VIDEO', url: 'https://bunny.net/security-project.mp4' },
        { title: 'Keystore & Security Threat Model PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/security-threat-model.pdf' }
      ],
      labs: [
        { title: 'Project Deliverable: Secure System & Policy Configurations', description: 'Implement Keystore credentials, Biometric HAL simulation, and encryption audit logging.' }
      ]
    },
    {
      title: 'C6-T6: Custom HAL Development',
      description: 'Design and develop a complete, low-level C++ AIDL hardware abstraction layer with kernel driver integration.',
      category: 'Course 6: Graduation Project',
      materials: [
        { title: 'C++ AIDL HAL & Driver Integration Video', type: 'VIDEO', url: 'https://bunny.net/hal-project.mp4' },
        { title: 'AIDL Interface Design Guide PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/aidl-hal-guide.pdf' }
      ],
      labs: [
        { title: 'Project Deliverable: AIDL HAL & Client App Code', description: 'Write custom C++ AIDL HAL, associate with SELinux policy, and build testing framework.' }
      ],
      quizQuestions: [
        {
          text: 'What is the standard build system tool used to compile AIDL HALs in modern AOSP?',
          options: [
            'Android.mk',
            'Android.bp (Soong)',
            'CMake',
            'Gradle'
          ],
          correctOption: 1
        },
        {
          text: 'Which security mechanism must be configured to allow a custom native HAL service to run and bind to the Binder domain?',
          options: [
            'Linux DAC permissions',
            'SELinux Mandatory Access Control policies',
            'Verified Boot signature',
            'AndroidManifest.xml permissions'
          ],
          correctOption: 1
        },
        {
          text: 'Under which AOSP root directory is vendor-specific hardware implementation code typically placed?',
          options: [
            '/system',
            '/frameworks',
            '/hardware or /device',
            '/packages'
          ],
          correctOption: 2
        },
        {
          text: 'When writing an AIDL interface for a HAL, what is the file extension used?',
          options: [
            '.aidl',
            '.hal',
            '.hidl',
            '.h'
          ],
          correctOption: 0
        },
        {
          text: 'Which tool or emulator allows developers to run and test full custom AOSP builds in a virtualized cloud/workstation environment with KVM?',
          options: [
            'Android Studio Virtual Device (AVD)',
            'Cuttlefish emulator',
            'QEMU generic ARM',
            'Docker container'
          ],
          correctOption: 1
        }
      ]
    },

    // --- COURSE 7: MOCK INTERVIEW & CAREER COACHING ---
    {
      title: 'C7-M1: Technical Interview Preparation',
      description: 'Prepare for AOSP fundamentals and internals interviews covering Binder, Zygote, boot flow, and frameworks.',
      category: 'Course 7: Career Coaching',
      materials: [
        { title: 'AOSP Technical Interview Prep Video', type: 'VIDEO', url: 'https://bunny.net/interview-prep.mp4' },
        { title: '30 Essential AOSP Interview Q&A PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/aosp-interview-qa.pdf' }
      ],
      labs: [
        { title: 'Lab 7.1: AOSP Knowledge Self-Assessment', description: 'Complete a mock interview self-assessment based on 30 fundamental AOSP topics.' }
      ]
    },
    {
      title: 'C7-M2: System Design Interviews',
      description: 'Master Android system design challenges: IVI systems, OTA update infrastructure, and multi-display management.',
      category: 'Course 7: Career Coaching',
      materials: [
        { title: 'Android System Design Framework Video', type: 'VIDEO', url: 'https://bunny.net/system-design-prep.mp4' },
        { title: 'Embedded System Architecture Patterns PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/embedded-system-design.pdf' }
      ],
      labs: [
        { title: 'Lab 7.2: Automotive IVI System Architecture Draft', description: 'Create a high-level component and data-flow diagram for an automotive IVI solution.' }
      ]
    },
    {
      title: 'C7-M3: Coding Challenges',
      description: 'Solve C++ system challenges (Binder-like IPC, init parser) and Android Java memory optimization scenarios.',
      category: 'Course 7: Career Coaching',
      materials: [
        { title: 'Embedded Coding Challenge Workshop Video', type: 'VIDEO', url: 'https://bunny.net/coding-challenges.mp4' },
        { title: 'C++ & Java Interview Practice Sheet PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/coding-interview-practice.pdf' }
      ],
      labs: [
        { title: 'Lab 7.3: Property Parser / IPC Implementation', description: 'Implement a basic init.rc parser or Binder-like IPC mechanism in C++.' }
      ]
    },
    {
      title: 'C7-M4: Resume & Portfolio Optimization',
      description: 'Optimize your resume using the STAR method, build an outstanding GitHub portfolio, and enhance your LinkedIn presence.',
      category: 'Course 7: Career Coaching',
      materials: [
        { title: 'AOSP Resume & Portfolio Building Video', type: 'VIDEO', url: 'https://bunny.net/portfolio-resume.mp4' },
        { title: 'Embedded Android Resume Template PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/resume-template.pdf' }
      ],
      labs: [
        { title: 'Lab 7.4: Technical Resume & GitHub Profile Submission', description: 'Submit your tailored resume and link to your graduation project GitHub repository.' }
      ]
    },
    {
      title: 'C7-M5: Career Roadmap & Negotiation',
      description: 'Understand Embedded Android levels, identify target companies (auto, phone, chipmakers), and learn salary negotiation strategies.',
      category: 'Course 7: Career Coaching',
      materials: [
        { title: 'Career Paths & Salary Negotiation Video', type: 'VIDEO', url: 'https://bunny.net/career-roadmap.mp4' },
        { title: 'Negotiation Scripts & Career Guide PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/career-negotiation-guide.pdf' }
      ],
      labs: [
        { title: 'Lab 7.5: 3-Month Job Search & Interview Plan', description: 'Draft a personalized job search plan including 10+ target companies and weekly schedule.' }
      ],
      quizQuestions: [
        {
          text: 'When receiving a job offer, what is the best strategy regarding sharing your salary expectation numbers?',
          options: [
            'State the highest possible number immediately',
            'Let the employer make the first offer and research market rates',
            'Accept whatever they offer to avoid conflict',
            'Refuse to discuss it until the first day of work'
          ],
          correctOption: 1
        },
        {
          text: 'What structure/method is recommended for writing experience bullets in an AOSP engineer\'s resume?',
          options: [
            'The Paragraph method',
            'The STAR method (Situation, Task, Action, Result)',
            'The Chronological Listing only',
            'The Keyword Stuffing method'
          ],
          correctOption: 1
        },
        {
          text: 'Which system design interview stage is critical to perform first when asked to "Design an Automotive IVI system"?',
          options: [
            'Drawing the database tables',
            'Clarifying functional and non-functional requirements',
            'Writing C++ interfaces',
            'Optimizing memory limits'
          ],
          correctOption: 1
        },
        {
          text: 'What is the typical entry-level base salary range for an Embedded Android/AOSP Engineer in the US?',
          options: [
            '$40k - $60k',
            '$80k - $100k',
            '$150k - $180k',
            '$200k+'
          ],
          correctOption: 1
        },
        {
          text: 'Which platform is best for hosting a public portfolio of AOSP configuration files and custom HAL code?',
          options: [
            'LinkedIn',
            'GitHub',
            'Medium',
            'StackOverflow'
          ],
          correctOption: 1
        }
      ]
    },

    // --- COURSE 8: INTERVIEW QUESTIONS ---
    {
      title: 'C8-M1: Theory Questions',
      description: 'Conceptual understanding of Android fundamentals, AOSP architecture, system services, security model, and boot process.',
      category: 'Course 8: Interview Questions',
      materials: [
        { title: 'AOSP Theory Questions Overview Video', type: 'VIDEO', url: 'https://bunny.net/theory-questions.mp4' },
        { title: 'AOSP Theory Reference Guide PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/theory-guide.pdf' }
      ],
      labs: [
        { title: 'Lab 8.1: Conceptual Interview Preparation Checklist', description: 'Review and practice answers for 50+ conceptual AOSP theory questions.' }
      ]
    },
    {
      title: 'C8-M2: Debugging Questions',
      description: 'Structured troubleshooting approaches for memory leaks, performance bottlenecks, crash analysis, and SELinux denials.',
      category: 'Course 8: Interview Questions',
      materials: [
        { title: 'AOSP Debugging Questions Overview Video', type: 'VIDEO', url: 'https://bunny.net/debugging-questions.mp4' },
        { title: 'AOSP Debugging & Troubleshooting Handbook PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/debugging-guide.pdf' }
      ],
      labs: [
        { title: 'Lab 8.2: Debugging Scenarios Walkthrough', description: 'Review and formulate answers for 40+ memory leak, SELinux, and tombstone crash debugging questions.' }
      ]
    },
    {
      title: 'C8-M3: Design Questions',
      description: 'System design scenarios, HAL interfaces, services architecture, scalability constraints, and engineering trade-offs.',
      category: 'Course 8: Interview Questions',
      materials: [
        { title: 'AOSP System Design Prep Video', type: 'VIDEO', url: 'https://bunny.net/design-questions.mp4' },
        { title: 'System Architecture Design Templates PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/design-guide.pdf' }
      ],
      labs: [
        { title: 'Lab 8.3: Custom HAL & Service Design Drafting', description: 'Practice architectural breakdown and design mapping for 30+ core AOSP design questions.' }
      ]
    },
    {
      title: 'C8-M4: Implementation Questions',
      description: 'Practical solutions for Binder IPC communication, custom service creation, HAL programming, build rules, and OTA updates.',
      category: 'Course 8: Interview Questions',
      materials: [
        { title: 'AOSP Implementation Code-Along Video', type: 'VIDEO', url: 'https://bunny.net/implementation-questions.mp4' },
        { title: 'Embedded Android Implementation Code Samples PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/implementation-guide.pdf' }
      ],
      labs: [
        { title: 'Lab 8.4: Binder IPC / HAL Implementation Review', description: 'Draft and review key code patterns for 50+ AOSP implementation challenges.' }
      ]
    },
    {
      title: 'C8-M5: Behavioral Questions',
      description: 'Formulating compelling responses using the STAR method for leadership, conflict resolution, and technical challenge scenarios.',
      category: 'Course 8: Interview Questions',
      materials: [
        { title: 'Behavioral & STAR Method Coaching Video', type: 'VIDEO', url: 'https://bunny.net/behavioral-coaching.mp4' },
        { title: 'STAR Method Behavioral Question Templates PDF', type: 'PDF', url: 'https://cloudflare-r2.aospcamp/behavioral-guide.pdf' }
      ],
      labs: [
        { title: 'Lab 8.5: Personal STAR Story Development', description: 'Formulate and refine your stories for 20+ engineering behavior questions.' }
      ],
      quizQuestions: [
        {
          text: 'In the STAR method for behavioral questions, what does the \'A\' stand for?',
          options: [
            'Analyze',
            'Action',
            'Approach',
            'Argument'
          ],
          correctOption: 1
        },
        {
          text: 'When asked a debugging question about a native crash (tombstone) during an interview, what is the best first step?',
          options: [
            'Guess the cause immediately',
            'Explain your methodology for locating and filtering logcat/tombstone files',
            'Ask to code a fix',
            'Rewrite the C++ code in Java'
          ],
          correctOption: 1
        },
        {
          text: 'How should you structure your response to a system design question under pressure?',
          options: [
            'Write code first',
            'Clarify requirements, scope high-level component diagrams, dive into details, and discuss trade-offs',
            'List all AOSP components alphabetically',
            'Ask the interviewer to solve it first'
          ],
          correctOption: 1
        },
        {
          text: 'What is the recommended strategy when you do not know the exact answer to a technical theory question?',
          options: [
            'Bluff or make up an answer',
            'State what you do know about the surrounding concepts and explain how you would find out the exact answer',
            'Ask to skip the question',
            'Remain silent'
          ],
          correctOption: 1
        },
        {
          text: 'True or False: You should prioritize discussing quantifiable impact (e.g. "reduced boot time by 40%") when explaining your projects during an interview.',
          options: [
            'True',
            'False'
          ],
          correctOption: 0
        }
      ]
    }
  ];

  // 5. Create Sessions in Database
  const createdSessions = [];
  for (const sessionData of sessionsToSeed) {
    const session = await prisma.masterSession.create({
      data: {
        title: sessionData.title,
        description: sessionData.description || '',
      },
    });

    console.log(`Created Session Record: ${session.title}`);

    // Seed Materials for the Session
    if (sessionData.materials) {
      for (const mat of sessionData.materials) {
        await prisma.material.create({
          data: {
            title: mat.title,
            type: mat.type as 'VIDEO' | 'PDF' | 'LINK' | 'RESOURCE',
            url: mat.url,
            masterSessionId: session.id,
          },
        });
      }
    }

    // Seed Labs for the Session
    if (sessionData.labs) {
      for (const l of sessionData.labs) {
        await prisma.lab.create({
          data: {
            title: l.title,
            description: l.description || '',
            masterSessionId: session.id,
          },
        });
      }
    }

    // Seed Quiz under the Session
    if (sessionData.quizQuestions) {
      const quiz = await prisma.quiz.create({
        data: {
          title: `${sessionData.title} Quiz`,
          masterSessionId: session.id,
        },
      });

      for (const q of sessionData.quizQuestions) {
        await prisma.question.create({
          data: {
            text: q.text,
            options: q.options,
            correctOption: q.correctOption,
            quizId: quiz.id,
          },
        });
      }
      console.log(`Linked Quiz & ${sessionData.quizQuestions.length} Questions to ${session.title}`);
    }

    createdSessions.push(session);
  }

  // 6. Link all sessions in order to July, September, and Expired Camps via CampSession
  // July Cohort: First 5 modules (Course 1) are visible. Rest are hidden.
  for (let index = 0; index < createdSessions.length; index++) {
    const session = createdSessions[index];

    // July Camp linking
    await prisma.campSession.create({
      data: {
        campId: activeCamp.id,
        masterSessionId: session.id,
        order: index + 1,
        isVisible: index < 5, // Course 1 visible, others initially hidden
      },
    });

    // September Camp linking
    await prisma.campSession.create({
      data: {
        campId: upcomingCamp.id,
        masterSessionId: session.id,
        order: index + 1,
        isVisible: false, // all initially hidden for upcoming camp
      },
    });

    // Expired Camp linking
    await prisma.campSession.create({
      data: {
        campId: expiredCamp.id,
        masterSessionId: session.id,
        order: index + 1,
        isVisible: true, // all sessions visible
      },
    });
  }

  console.log(`Successfully mapped all ${createdSessions.length} sessions to all Camps in sequential order.`);
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
