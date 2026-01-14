import { supabase } from '@/lib/supabase';
import ChapterTracker from '@/components/ChapterTracker';
import { notFound } from 'next/navigation';

const SLUG_TO_NAME: Record<string, string> = {
    'physics': 'Physics',
    'math': 'Math',
    'physical-chemistry': 'Physical Chemistry',
    'inorganic-chemistry': 'Inorganic Chemistry',
    'organic-chemistry': 'Organic Chemistry',
};

export default async function SubjectPage({ params }: { params: { slug: string } }) {
    const subjectName = SLUG_TO_NAME[params.slug];

    if (!subjectName) {
        notFound();
    }

    // Fetch subject id
    const { data: subjectData } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subjectName)
        .single();

    if (!subjectData) {
        notFound();
    }

    // Fetch chapters
    const { data: chapters } = await supabase
        .from('chapters')
        .select('*')
        .eq('subject_id', subjectData.id)
        .order('chapter_no', { ascending: true });

    return (
        <div className="subject-page">
            <header className="page-header">
                <h1>{subjectName} <span className="text-muted">/ Syllabus</span></h1>
                <p className="text-muted">Track your progress and solved questions per chapter.</p>
            </header>

            <div className="chapter-list">
                {chapters?.map((chapter) => (
                    <ChapterTracker key={chapter.id} chapter={chapter} subject={subjectName} />
                ))}
            </div>
        </div>
    );
}
