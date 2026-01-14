const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    const syllabus = JSON.parse(fs.readFileSync('syllabus_data.json', 'utf8'));

    for (const [subjectName, chapters] of Object.entries(syllabus)) {
        // Get subject id
        const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('id')
            .eq('name', subjectName)
            .single();

        if (subjectError) {
            console.error(`Error finding subject ${subjectName}:`, subjectError);
            continue;
        }

        const subjectId = subjectData.id;

        for (const chapter of chapters) {
            const { error: chapterError } = await supabase
                .from('chapters')
                .insert({
                    subject_id: subjectId,
                    chapter_no: chapter['Chapter No'],
                    name: chapter['Chapter Name'],
                    total_lectures: chapter['Total Lectures'] || 0,
                    total_dpps: chapter['Total DPPs'] || 0
                });

            if (chapterError) {
                console.error(`Error inserting chapter ${chapter['Chapter Name']}:`, chapterError);
            } else {
                console.log(`Inserted ${chapter['Chapter Name']}`);
            }
        }
    }
}

seed();
