<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\University;
use App\Models\College;
use App\Models\Program;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\Unit;
use App\Models\Topic;
use App\Models\Resource;
use App\Models\Note;
use App\Models\Video;
use App\Models\Literature;
use App\Models\PreviousPaper;
use App\Models\PracticalResource;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
use App\Models\Tag;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Admin',
            'email' => 'admin@rxpharma.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        // Demo student
        $student = User::create([
            'name' => 'Priya Sharma',
            'email' => 'student@rxpharma.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'email_verified_at' => now(),
            'is_active' => true,
            'phone' => '+977-9841234567',
            'bio' => 'Third year B.Pharm student interested in pharmacology.',
        ]);

        // Settings
        Setting::set('site_name', 'RX Pharma');
        Setting::set('tagline', 'Learn • Practice • Succeed');
        Setting::set('contact_email', 'info@rxpharma.com');
        Setting::set('contact_phone', '+977-01-5555666');
        Setting::set('footer_text', '© ' . date('Y') . ' RX Pharma. All rights reserved.');

        // Tags
        $tagNames = ['pharmacology', 'antibiotics', 'physiology', 'anatomy', 'chemistry',
            'pharmaceutics', 'microbiology', 'pathology', 'dosage', 'clinical', 'laboratory',
            'drug-classification', 'therapeutics', 'toxicology', 'dispensing', 'exam-prep'];

        $tags = [];
        foreach ($tagNames as $tag) {
            $tags[] = Tag::create(['name' => ucfirst(str_replace('-', ' ', $tag)), 'slug' => $tag]);
        }

        // Universities
        $tu = University::create([
            'name' => 'Tribhuvan University',
            'slug' => 'tribhuvan-university',
            'code' => 'TU',
            'location' => 'Kathmandu, Nepal',
            'description' => 'The oldest and largest university in Nepal, established in 1959. Tribhuvan University is the national university of Nepal, offering various programs across multiple disciplines including pharmacy and medical sciences.',
            'acronym' => 'TU',
            'is_active' => true,
        ]);

        $ku = University::create([
            'name' => 'Kathmandu University',
            'slug' => 'kathmandu-university',
            'code' => 'KU',
            'location' => 'Dhulikhel, Nepal',
            'description' => 'A private, non-profit university founded in 1991. Known for its quality education and modern approach to pharmacy and medical sciences.',
            'acronym' => 'KU',
            'is_active' => true,
        ]);

        $pu = University::create([
            'name' => 'Pokhara University',
            'slug' => 'pokhara-university',
            'code' => 'POU',
            'location' => 'Pokhara, Nepal',
            'description' => 'A university established in 1997 offering various undergraduate and graduate programs in pharmacy and health sciences.',
            'acronym' => 'PU',
            'is_active' => true,
        ]);

        $pub = University::create([
            'name' => 'Purbanchal University',
            'slug' => 'purbanchal-university',
            'code' => 'PU',
            'location' => 'Biratnagar, Nepal',
            'description' => 'A university in eastern Nepal offering programs in pharmacy and various health science disciplines.',
            'is_active' => true,
        ]);

        // Colleges under TU
        $iom = College::create([
            'university_id' => $tu->id,
            'name' => 'Institute of Medicine',
            'slug' => 'institute-of-medicine',
            'location' => 'Maharajgunj, Kathmandu',
            'address' => 'Maharajgunj, Kathmandu 44600',
            'description' => 'One of the premier medical education institutions in Nepal under Tribhuvan University.',
            'is_active' => true,
        ]);

        $cmc = College::create([
            'university_id' => $tu->id,
            'name' => 'Chitwan Medical College',
            'slug' => 'chitwan-medical-college',
            'location' => 'Bharatpur, Chitwan',
            'description' => 'A medical college in Chitwan district affiliated with Tribhuvan University.',
            'is_active' => true,
        ]);

        College::create([
            'university_id' => $tu->id,
            'name' => 'Manmohan Memorial Institute of Health Sciences',
            'slug' => 'manmohan-memorial-institute',
            'location' => 'Kathmandu',
            'description' => 'An institution offering pharmacy and health science programs in Kathmandu.',
            'is_active' => true,
        ]);

        College::create([
            'university_id' => $tu->id,
            'name' => 'Universal College of Medical Sciences',
            'slug' => 'universal-college-medical-sciences',
            'location' => 'Bhairahawa, Rupandehi',
            'description' => 'A medical college in the western Terai region of Nepal affiliated with TU.',
            'is_active' => true,
        ]);

        // Colleges under KU
        $bpharmCollege = College::create([
            'university_id' => $ku->id,
            'name' => 'Kathmandu University School of Science',
            'slug' => 'ku-school-of-science',
            'location' => 'Dhulikhel, Kavre',
            'description' => 'The School of Science at Kathmandu University offering B.Pharm and related programs.',
            'is_active' => true,
        ]);

        // Programs
        $bpharm = Program::updateOrCreate(
            ['university_id' => $tu->id, 'slug' => 'b-pharm'],
            [
                'name' => 'B.Pharm',
                'code' => 'BPH',
                'level' => 'Bachelor',
                'duration_years' => 4,
                'description' => 'Bachelor of Pharmacy - A four-year undergraduate program in pharmaceutical sciences.',
                'is_active' => true,
            ]
        );

        $dpharm = Program::updateOrCreate(
            ['university_id' => $tu->id, 'slug' => 'diploma-in-pharmacy'],
            [
                'name' => 'Diploma in Pharmacy',
                'code' => 'DPH',
                'level' => 'Diploma',
                'duration_years' => 3,
                'description' => 'A three-year diploma program in pharmacy covering fundamental pharmaceutical knowledge.',
                'is_active' => true,
            ]
        );

        $bnursing = Program::updateOrCreate(
            ['university_id' => $tu->id, 'slug' => 'b-sc-nursing'],
            [
                'name' => 'B.Sc. Nursing',
                'code' => 'BNR',
                'level' => 'Bachelor',
                'duration_years' => 4,
                'description' => 'Bachelor of Science in Nursing - A four-year program in nursing sciences.',
                'is_active' => true,
            ]
        );

        Program::updateOrCreate(
            ['university_id' => $ku->id, 'slug' => 'b-pharm'],
            [
                'name' => 'B.Pharm',
                'code' => 'BPH-KU',
                'level' => 'Bachelor',
                'duration_years' => 4,
                'description' => 'Bachelor of Pharmacy at Kathmandu University.',
                'is_active' => true,
            ]
        );

        // Semesters for B.Pharm
        $semesters = [];
        $semesterNames = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester'];
        foreach ($semesterNames as $i => $name) {
            $semesters[] = Semester::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'program_id' => $bpharm->id,
                    'name' => $name,
                    'number' => $i + 1,
                    'is_active' => true,
                ]
            );
        }

        // Subjects for 3rd semester B.Pharm
        $pharmacology = Subject::create([
            'semester_id' => $semesters[2]->id,
            'program_id' => $bpharm->id,
            'name' => 'Pharmacology',
            'slug' => 'pharmacology',
            'code' => 'PH-301',
            'description' => 'Study of drug actions, mechanisms, therapeutic uses, and adverse effects. Covers general pharmacology, autonomic pharmacology, and systemic pharmacology.',
            'color' => '#0B63CE',
            'is_active' => true,
        ]);

        $pharmaceutics = Subject::create([
            'semester_id' => $semesters[2]->id,
            'program_id' => $bpharm->id,
            'name' => 'Pharmaceutics',
            'slug' => 'pharmaceutics',
            'code' => 'PH-302',
            'description' => 'Study of pharmaceutical dosage forms, drug delivery systems, formulation technology, and pharmaceutical manufacturing processes.',
            'color' => '#16A34A',
            'is_active' => true,
        ]);

        $pharmChem = Subject::create([
            'semester_id' => $semesters[2]->id,
            'program_id' => $bpharm->id,
            'name' => 'Pharmaceutical Chemistry',
            'slug' => 'pharmaceutical-chemistry',
            'code' => 'PH-303',
            'description' => 'Study of chemical structures, synthesis, and structure-activity relationships of drug molecules.',
            'color' => '#DC2626',
            'is_active' => true,
        ]);

        $anatomy = Subject::create([
            'semester_id' => $semesters[2]->id,
            'program_id' => $bpharm->id,
            'name' => 'Human Anatomy',
            'slug' => 'human-anatomy',
            'code' => 'PH-304',
            'description' => 'Detailed study of human body structure including musculoskeletal, cardiovascular, nervous, and other organ systems.',
            'color' => '#F59E0B',
            'is_active' => true,
        ]);

        $physiology = Subject::create([
            'semester_id' => $semesters[3]->id,
            'program_id' => $bpharm->id,
            'name' => 'Physiology',
            'slug' => 'physiology',
            'code' => 'PH-401',
            'description' => 'Study of normal functions of the human body systems and their regulatory mechanisms.',
            'color' => '#8B5CF6',
            'is_active' => true,
        ]);

        $community = Subject::create([
            'semester_id' => $semesters[3]->id,
            'program_id' => $bpharm->id,
            'name' => 'Community Pharmacy',
            'slug' => 'community-pharmacy',
            'code' => 'PH-402',
            'description' => 'Study of pharmaceutical care in community settings, patient counseling, drug information services, and public health.',
            'color' => '#06B6D4',
            'is_active' => true,
        ]);

        $pathophysiology = Subject::create([
            'semester_id' => $semesters[4]->id,
            'program_id' => $bpharm->id,
            'name' => 'Pathophysiology',
            'slug' => 'pathophysiology',
            'code' => 'PH-501',
            'description' => 'Study of disease mechanisms and abnormal physiological processes in the human body.',
            'color' => '#EC4899',
            'is_active' => true,
        ]);

        $microbiology = Subject::create([
            'semester_id' => $semesters[4]->id,
            'program_id' => $bpharm->id,
            'name' => 'Microbiology',
            'slug' => 'microbiology',
            'code' => 'PH-502',
            'description' => 'Study of microorganisms including bacteria, viruses, fungi, and their roles in health and disease.',
            'color' => '#14B8A6',
            'is_active' => true,
        ]);

        // Units for Pharmacology
        $pharmUnits = [];
        $unitData = [
            ['Introduction to Pharmacology', 'Introduction to the basic concepts of pharmacology, including routes of drug administration, drug nomenclature, and pharmacological terminology.'],
            ['Pharmacokinetics', 'Study of drug absorption, distribution, metabolism, and excretion (ADME). Mathematical models and clinical applications.'],
            ['Pharmacodynamics', 'Study of drug mechanisms of action at the molecular, cellular, and organ system levels. Dose-response relationships.'],
            ['Autonomic Pharmacology', 'Drugs acting on the autonomic nervous system including cholinergic, adrenergic, and ganglionic agents.'],
            ['Drugs Affecting Cardiovascular System', 'Antihypertensives, antiarrhythmics, antianginal drugs, and drugs for heart failure management.'],
            ['Chemotherapy', 'Antimicrobial agents, antibiotics, antivirals, antifungals, and antiparasitic drugs.'],
        ];

        foreach ($unitData as [$name, $desc]) {
            $pharmUnits[] = Unit::create([
                'subject_id' => $pharmacology->id,
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => $desc,
                'sort_order' => count($pharmUnits) + 1,
                'is_active' => true,
            ]);
        }

        // Topics for Unit 1
        $topicData = [
            'Definition and Scope of Pharmacology',
            'Routes of Drug Administration',
            'Drug Nomenclature',
            'Pharmacological Terminology',
            'Sources of Drugs',
            'Drug Receptors and Mechanism of Action',
        ];
        foreach ($topicData as $i => $name) {
            Topic::create([
                'unit_id' => $pharmUnits[0]->id,
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => null,
                'sort_order' => $i + 1,
                'is_active' => true,
            ]);
        }

        // Units for Pharmaceutics
        $pharmaceuticsUnits = [
            ['Pharmaceutical Dosage Forms', 'Solid, liquid, and semisolid dosage forms.'],
            ['Drug Delivery Systems', 'Controlled release, sustained release, and targeted delivery.'],
            ['Pharmaceutical Calculations', 'Dose calculations, dilution, and concentration.'],
        ];
        foreach ($pharmaceuticsUnits as [$name, $desc]) {
            Unit::create([
                'subject_id' => $pharmaceutics->id,
                'name' => $name,
                'slug' => Str::slug($name),
                'description' => $desc,
                'sort_order' => 1,
                'is_active' => true,
            ]);
        }

        // Create Published Resources - Notes
        $notesData = [
            ['title' => 'Introduction to Pharmacology - Unit 1 Notes', 'description' => 'Comprehensive notes covering the fundamentals of pharmacology including definition, scope, routes of drug administration, drug nomenclature, and basic pharmacological terminology. Essential for B.Pharm 3rd semester students.', 'subject' => $pharmacology, 'unit' => $pharmUnits[0], 'author' => 'Dr. Anil Kumar', 'featured' => true, 'tags' => ['pharmacology', 'dosage'], 'toc' => [
                ['title' => '1. Introduction to Pharmacology', 'page' => 1],
                ['title' => '2. Definition and Scope', 'page' => 2],
                ['title' => '3. Routes of Drug Administration', 'page' => 5],
                ['title' => '4. Drug Nomenclature', 'page' => 8],
                ['title' => '5. Pharmacological Terminology', 'page' => 10],
            ]],
            ['title' => 'Pharmacokinetics Complete Notes', 'description' => 'Detailed study of pharmacokinetics including absorption, distribution, metabolism, and excretion of drugs. Includes mathematical models and clinical correlations.', 'subject' => $pharmacology, 'unit' => $pharmUnits[1], 'author' => 'Dr. Suman Basnet', 'tags' => ['pharmacology'], 'toc' => [
                ['title' => '1. Absorption', 'page' => 1],
                ['title' => '2. Distribution', 'page' => 8],
                ['title' => '3. Metabolism', 'page' => 15],
                ['title' => '4. Excretion', 'page' => 22],
                ['title' => '5. Clinical Applications', 'page' => 30],
            ]],
            ['title' => 'Pharmacodynamics Study Guide', 'description' => 'Complete guide to pharmacodynamics covering drug receptors, dose-response relationships, therapeutic index, and mechanisms of drug action.', 'subject' => $pharmacology, 'unit' => $pharmUnits[2], 'author' => 'Dr. Ram Prasad', 'tags' => ['pharmacology'], 'toc' => [
                ['title' => '1. Drug Receptors', 'page' => 1],
                ['title' => '2. Dose-Response', 'page' => 6],
                ['title' => '3. Potency and Efficacy', 'page' => 12],
                ['title' => '4. Therapeutic Index', 'page' => 15],
            ]],
            ['title' => 'Dosage Forms and Formulations', 'description' => 'Study of pharmaceutical dosage forms including tablets, capsules, solutions, suspensions, emulsions, and ointments.', 'subject' => $pharmaceutics, 'author' => 'Dr. Kamala Rai', 'tags' => ['pharmaceutics', 'dosage'], 'toc' => null],
            ['title' => 'Antibiotic Classification - Complete Guide', 'description' => 'Comprehensive classification of antibiotics including mechanism of action, spectrum, resistance patterns, and clinical uses of major antibiotic groups.', 'subject' => $pharmacology, 'unit' => $pharmUnits[5], 'author' => 'Dr. Anil Kumar', 'featured' => true, 'tags' => ['pharmacology', 'antibiotics'], 'toc' => [
                ['title' => '1. Beta-Lactams', 'page' => 1],
                ['title' => '2. Macrolides', 'page' => 5],
                ['title' => '3. Tetracyclines', 'page' => 8],
                ['title' => '4. Aminoglycosides', 'page' => 11],
                ['title' => '5. Fluoroquinolones', 'page' => 14],
            ]],
            ['title' => 'Human Anatomy - Musculoskeletal System', 'description' => 'Detailed notes on the musculoskeletal system covering bones, joints, muscles, and their clinical relevance in pharmaceutical practice.', 'subject' => $anatomy, 'author' => 'Dr. Bikash Thapa', 'tags' => ['anatomy'], 'toc' => null],
            ['title' => 'Cardiovascular Pharmacology', 'description' => 'Comprehensive notes on drugs affecting the cardiovascular system including antihypertensives, antiarrhythmics, and drugs for angina.', 'subject' => $pharmacology, 'unit' => $pharmUnits[4], 'author' => 'Dr. Ram Prasad', 'tags' => ['pharmacology'], 'toc' => null],
            ['title' => 'Pharmaceutical Calculations Handbook', 'description' => 'Reference handbook for pharmaceutical calculations including dosage calculations, dilution, concentration, and isotonicity calculations.', 'subject' => $pharmaceutics, 'author' => 'Dr. Kamala Rai', 'tags' => ['pharmaceutics'], 'toc' => null],
        ];

        foreach ($notesData as $noteData) {
            $resource = Resource::create([
                'title' => $noteData['title'],
                'slug' => Str::slug($noteData['title']),
                'description' => $noteData['description'],
                'resource_type' => 'note',
                'university_id' => $tu->id,
                'college_id' => $iom->id,
                'program_id' => $bpharm->id,
                'semester_id' => $semesters[2]->id,
                'subject_id' => $noteData['subject']->id,
                'unit_id' => $noteData['unit']->id ?? null,
                'status' => 'published',
                'featured' => $noteData['featured'] ?? false,
                'views_count' => rand(20, 500),
                'bookmarks_count' => rand(3, 80),
                'downloads_count' => rand(5, 200),
                'published_at' => now()->subDays(rand(1, 60)),
                'created_by' => 1,
            ]);

            Note::create([
                'resource_id' => $resource->id,
                'author' => $noteData['author'],
                'toc' => $noteData['toc'],
                'pages' => rand(8, 50),
            ]);

            foreach ($noteData['tags'] ?? [] as $tagName) {
                $tag = Tag::where('slug', $tagName)->first();
                if ($tag) {
                    $resource->tags()->attach($tag->id);
                }
            }
        }

        // Videos
        $videosData = [
            ['title' => 'Introduction to Pharmacology - Lecture 1', 'description' => 'First lecture in the pharmacology series covering the basic concepts, definitions, and scope of pharmacology.', 'subject' => $pharmacology, 'duration' => 1834, 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            ['title' => 'Drug Classification and Routes of Administration', 'description' => 'Comprehensive overview of drug classification systems and various routes of drug administration with examples.', 'subject' => $pharmacology, 'duration' => 1205, 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            ['title' => 'Antibiotics - Mechanism of Action', 'description' => 'Video lecture explaining the mechanism of action of various antibiotic classes including beta-lactams, macrolides, and fluoroquinolones.', 'subject' => $pharmacology, 'duration' => 2460, 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            ['title' => 'Pharmaceutical Dosage Forms Explained', 'description' => 'Visual guide to different pharmaceutical dosage forms with examples and manufacturing processes.', 'subject' => $pharmaceutics, 'duration' => 1575, 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            ['title' => 'Autonomic Nervous System Pharmacology', 'description' => 'Detailed lecture on drugs affecting the autonomic nervous system including cholinergic and adrenergic pathways.', 'subject' => $pharmacology, 'duration' => 2190, 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
            ['title' => 'Human Anatomy - Skeletal System', 'description' => 'Visual lecture covering the human skeletal system with 3D animations and clinical correlations.', 'subject' => $anatomy, 'duration' => 1845, 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        ];

        foreach ($videosData as $vidData) {
            $resource = Resource::create([
                'title' => $vidData['title'],
                'slug' => Str::slug($vidData['title']),
                'description' => $vidData['description'],
                'resource_type' => 'video',
                'university_id' => $tu->id,
                'program_id' => $bpharm->id,
                'semester_id' => $semesters[2]->id,
                'subject_id' => $vidData['subject']->id,
                'status' => 'published',
                'views_count' => rand(30, 800),
                'bookmarks_count' => rand(5, 100),
                'published_at' => now()->subDays(rand(1, 30)),
                'created_by' => 1,
            ]);

            Video::create([
                'resource_id' => $resource->id,
                'video_url' => $vidData['url'],
                'video_type' => 'url',
                'duration_seconds' => $vidData['duration'],
            ]);
        }

        // Literature
        $litData = [
            ['title' => 'WHO Model List of Essential Medicines', 'description' => 'The WHO essential medicines list providing guidance on priority medicines for primary healthcare.', 'category' => 'who_guidelines', 'author' => 'World Health Organization', 'org' => 'WHO', 'year' => 2023],
            ['title' => 'Antimicrobial Resistance Global Report', 'description' => 'Comprehensive global report on antimicrobial resistance and its implications for public health.', 'category' => 'research_articles', 'author' => 'WHO', 'org' => 'WHO', 'year' => 2023],
            ['title' => 'National Essential Medicines List of Nepal', 'description' => 'Nepal national list of essential medicines published by the Department of Drug Administration.', 'category' => 'government_documents', 'author' => 'DDA Nepal', 'org' => 'Department of Drug Administration', 'year' => 2022],
            ['title' => 'British Pharmacopoeia 2024', 'description' => 'Official pharmaceutical standards for medicines in the United Kingdom.', 'category' => 'pharmacopoeia', 'author' => 'British Pharmacopoeia Commission', 'org' => 'MHRA', 'year' => 2024],
            ['title' => 'Clinical Guidelines for Pharmacy Practice', 'description' => 'Evidence-based clinical guidelines for pharmacy practice in hospital and community settings.', 'category' => 'clinical_guidelines', 'author' => 'BPS', 'org' => 'British Pharmacological Society', 'year' => 2023],
        ];

        foreach ($litData as $lit) {
            $resource = Resource::create([
                'title' => $lit['title'],
                'slug' => Str::slug($lit['title']),
                'description' => $lit['description'],
                'resource_type' => 'literature',
                'university_id' => $tu->id,
                'program_id' => $bpharm->id,
                'semester_id' => $semesters[2]->id,
                'status' => 'published',
                'views_count' => rand(10, 200),
                'bookmarks_count' => rand(2, 50),
                'published_at' => now()->subDays(rand(1, 120)),
                'created_by' => 1,
            ]);

            Literature::create([
                'resource_id' => $resource->id,
                'category' => $lit['category'],
                'author' => $lit['author'],
                'organization' => $lit['org'],
                'year' => $lit['year'],
            ]);
        }

        // Previous Papers
        $paperYears = [2024, 2023, 2022, 2021];
        foreach ($paperYears as $year) {
            $subjects = [$pharmacology, $pharmaceutics, $anatomy];
            foreach ($subjects as $subj) {
                $resource = Resource::create([
                    'title' => "{$subj->name} - {$year} Final Exam",
                    'slug' => Str::slug("{$subj->name} {$year} final exam"),
                    'description' => "Previous year examination paper for {$subj->name} - {$year} academic session.",
                    'resource_type' => 'previous_paper',
                    'university_id' => $tu->id,
                    'program_id' => $bpharm->id,
                    'semester_id' => $semesters[2]->id,
                    'subject_id' => $subj->id,
                    'status' => 'published',
                    'views_count' => rand(20, 300),
                    'downloads_count' => rand(10, 150),
                    'published_at' => now()->subDays(rand(1, 200)),
                    'created_by' => 1,
                ]);

                PreviousPaper::create([
                    'resource_id' => $resource->id,
                    'year' => $year,
                    'exam_type' => 'Final',
                    'has_answer_key' => $year >= 2023,
                ]);
            }
        }

        // Practical Resources
        $practicalData = [
            ['title' => 'Pharmacology Practical - Drug Identification Lab', 'type' => 'practical_notes', 'description' => 'Complete practical guide for drug identification laboratory sessions in pharmacology.'],
            ['title' => 'Micropipetting Technique Lab Manual', 'type' => 'lab_manuals', 'description' => 'Step-by-step lab manual for micropipetting techniques used in pharmaceutical analysis.'],
            ['title' => 'Pharmacy Viva Questions - Top 50', 'type' => 'viva_questions', 'description' => 'Most commonly asked viva voce questions in pharmacy examinations with suggested answers.'],
        ];

        foreach ($practicalData as $p) {
            $resource = Resource::create([
                'title' => $p['title'],
                'slug' => Str::slug($p['title']),
                'description' => $p['description'],
                'resource_type' => 'practical',
                'university_id' => $tu->id,
                'program_id' => $bpharm->id,
                'semester_id' => $semesters[2]->id,
                'subject_id' => $pharmacology->id,
                'status' => 'published',
                'views_count' => rand(5, 100),
                'published_at' => now()->subDays(rand(1, 45)),
                'created_by' => 1,
            ]);

            PracticalResource::create([
                'resource_id' => $resource->id,
                'practical_type' => $p['type'],
            ]);
        }

        // Quiz
        $quiz = Quiz::create([
            'title' => 'Pharmacology Fundamentals Quiz',
            'slug' => 'pharmacology-fundamentals-quiz',
            'description' => 'Test your knowledge of basic pharmacology concepts including drug classification, routes of administration, and pharmacokinetics.',
            'subject_id' => $pharmacology->id,
            'semester_id' => $semesters[2]->id,
            'duration_minutes' => 10,
            'passing_score' => 60,
            'difficulty' => 'medium',
            'status' => 'published',
            'featured' => true,
            'created_by' => 1,
        ]);

        $quizQuestions = [
            ['q' => 'What is the primary route of drug administration for rapid onset of action?',
             'options' => ['Oral', 'Intravenous', 'Subcutaneous', 'Topical'],
             'correct' => 1, 'explanation' => 'Intravenous administration provides the most rapid onset of action as the drug enters the bloodstream directly.'],
            ['q' => 'Which organ is primarily responsible for drug metabolism?',
             'options' => ['Kidney', 'Liver', 'Lung', 'Spleen'],
             'correct' => 1, 'explanation' => 'The liver is the primary organ for drug metabolism through hepatic enzyme systems, particularly cytochrome P450.'],
            ['q' => 'The study of drug absorption, distribution, metabolism, and excretion is called:',
             'options' => ['Pharmacodynamics', 'Pharmacokinetics', 'Pharmacology', 'Toxicology'],
             'correct' => 1, 'explanation' => 'Pharmacokinetics is the study of ADME - Absorption, Distribution, Metabolism, and Excretion of drugs.'],
            ['q' => 'Which of the following is NOT a route of drug administration?',
             'options' => ['Intramuscular', 'Transdermal', 'Internally', 'Sublingual'],
             'correct' => 2, 'explanation' => '"Internally" is not a recognized route of drug administration. The standard routes include oral, parenteral, and topical.'],
            ['q' => 'The therapeutic index is defined as:',
             'options' => ['TD50/ED50', 'ED50/TD50', 'LD50/ED50', 'Both A and C'],
             'correct' => 3, 'explanation' => 'The therapeutic index is commonly expressed as TD50/ED50 or LD50/ED50. A higher TI indicates greater safety.'],
            ['q' => 'Which type of drug receptor mediates its response through G-proteins?',
             'options' => ['Ion channel receptors', 'Enzyme-linked receptors', 'G-protein coupled receptors', 'Nuclear receptors'],
             'correct' => 2, 'explanation' => 'G-protein coupled receptors (GPCRs) are a major class of drug receptors that mediate responses through G-protein signaling cascades.'],
            ['q' => 'What does the term "bioavailability" refer to?',
             'options' => ['Drug concentration in plasma', 'Fraction of drug reaching systemic circulation', 'Total amount of drug in body', 'Drug half-life'],
             'correct' => 1, 'explanation' => 'Bioavailability is the fraction of an administered dose of drug that reaches the systemic circulation unchanged.'],
            ['q' => 'Which cytochrome P450 enzyme is most commonly involved in drug metabolism?',
             'options' => ['CYP1A2', 'CYP2D6', 'CYP3A4', 'CYP2C9'],
             'correct' => 2, 'explanation' => 'CYP3A4 is the most abundant CYP enzyme in the human liver and is involved in the metabolism of approximately 50% of clinically used drugs.'],
            ['q' => 'First-pass metabolism occurs after which route of administration?',
             'options' => ['Intravenous', 'Sublingual', 'Oral', 'Intramuscular'],
             'correct' => 2, 'explanation' => 'First-pass metabolism occurs after oral administration as absorbed drugs pass through the liver via the portal circulation before reaching systemic circulation.'],
            ['q' => 'Which of the following antibiotics inhibits bacterial cell wall synthesis?',
             'options' => ['Tetracycline', 'Penicillin', 'Erythromycin', 'Ciprofloxacin'],
             'correct' => 1, 'explanation' => 'Penicillin and other beta-lactam antibiotics inhibit bacterial cell wall synthesis by blocking transpeptidase enzymes involved in peptidoglycan cross-linking.'],
            ['q' => 'The time required for the plasma concentration of a drug to reduce by 50% is called:',
             'options' => ['Onset time', 'Half-life (t1/2)', 'Duration of action', 'Peak time'],
             'correct' => 1, 'explanation' => 'The elimination half-life (t1/2) is the time required for the plasma concentration to decrease by 50%.'],
            ['q' => 'Sympatholytic drugs act by:',
             'options' => ['Stimulating sympathetic activity', 'Blocking sympathetic activity', 'Enhancing parasympathetic activity', 'Blocking parasympathetic activity'],
             'correct' => 1, 'explanation' => 'Sympatholytic drugs block or inhibit sympathetic nervous system activity at various levels of the reflex arc.'],
            ['q' => 'Atropine is a competitive antagonist at:',
             'options' => ['Alpha adrenergic receptors', 'Beta adrenergic receptors', 'Muscarinic receptors', 'Nicotinic receptors'],
             'correct' => 2, 'explanation' => 'Atropine is a competitive muscarinic receptor antagonist that blocks the effects of acetylcholine at muscarinic sites.'],
            ['q' => 'Which of the following is a bacteriostatic antibiotic?',
             'options' => ['Penicillin', 'Gentamicin', 'Tetracycline', 'Cephalosporin'],
             'correct' => 2, 'explanation' => 'Tetracycline is bacteriostatic - it inhibits bacterial growth without directly killing the organisms, unlike bactericidal antibiotics like penicillin.'],
            ['q' => 'The maximum effect a drug can produce is called:',
             'options' => ['Potency', 'Efficacy', 'Selectivity', 'Sensitivity'],
             'correct' => 1, 'explanation' => 'Efficacy (Emax) is the maximum effect a drug can produce regardless of dose, representing the ceiling of the dose-response curve.'],
            ['q' => 'Diazepam acts on which neurotransmitter receptor?',
             'options' => ['Serotonin (5-HT)', 'GABA-A', 'Dopamine D2', 'Glutamate NMDA'],
             'correct' => 1, 'explanation' => 'Diazepam is a benzodiazepine that acts as a positive allosteric modulator at GABA-A receptors, enhancing inhibitory neurotransmission.'],
        ];

        foreach ($quizQuestions as $i => $qData) {
            $question = QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question' => $qData['q'],
                'explanation' => $qData['explanation'],
                'difficulty' => $i < 5 ? 'easy' : ($i < 11 ? 'medium' : 'hard'),
                'sort_order' => $i + 1,
            ]);

            $labels = ['A', 'B', 'C', 'D'];
            foreach ($qData['options'] as $j => $optionText) {
                QuizOption::create([
                    'question_id' => $question->id,
                    'label' => $labels[$j],
                    'option_text' => $optionText,
                    'is_correct' => $j === $qData['correct'],
                    'sort_order' => $j + 1,
                ]);
            }
        }

        $quiz->update(['total_questions' => $quizQuestions ? count($quizQuestions) : 16]);

        echo "Database seeded successfully!\n";
        echo "Admin: admin@rxpharma.com / password\n";
        echo "Student: student@rxpharma.com / password\n";
    }
}