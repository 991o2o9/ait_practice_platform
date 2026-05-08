import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Separator } from '@/shared/ui/separator';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';

// Моковые данные для примера (потом заменим на данные с API)
const MOCK_TASKS = [
  { id: 1, title: 'Basic Models', status: 'passed', difficulty: 'easy' },
  { id: 2, title: 'Enrollment Entity', status: 'current', difficulty: 'medium' },
  { id: 3, title: 'Course Assignment', status: 'locked', difficulty: 'hard' },
  { id: 4, title: 'Grading Logic', status: 'locked', difficulty: 'hard' },
];

const MOCK_MARKDOWN = `
### Реализация сущности Enrollment

Вам необходимо создать связующую сущность \`Enrollment\` для реализации связи "многие ко многим" между \`Student\` и \`Course\`.

**Требования:**
- Поле \`id\` типа UUID (primary key)
- Поле \`student_id\` (foreign key)
- Поле \`course_id\` (foreign key)
- Поле \`enrollment_date\` типа \`datetime\`

\`\`\`python
class Enrollment:
    # Your code here
    pass
\`\`\`

**Подсказка:** Используйте \`uuid4()\` для генерации ID по умолчанию.
`;

export function TaskSidebar() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border shrink-0">
        <h2 className="font-semibold text-lg tracking-tight">Project Steps</h2>
        <p className="text-sm text-muted-foreground mt-1">Complete all steps to finish the project.</p>
      </div>

      {/* Stepper (List of tasks) */}
      <ScrollArea className="h-[30%] border-b border-border">
        <div className="p-4 space-y-3">
          {MOCK_TASKS.map((task, index) => (
            <div 
              key={task.id} 
              className={`flex items-start gap-3 p-2 rounded-md transition-colors ${task.status === 'current' ? 'bg-primary/10' : ''}`}
            >
              <div className="mt-0.5 shrink-0">
                {task.status === 'passed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {task.status === 'current' && <Circle className="h-5 w-5 text-primary fill-primary/20" />}
                {task.status === 'locked' && <Lock className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium truncate ${task.status === 'locked' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {index + 1}. {task.title}
                  </p>
                  <Badge variant={task.difficulty === 'easy' ? 'secondary' : task.difficulty === 'medium' ? 'default' : 'destructive'} className="text-[10px] px-1.5 py-0">
                    {task.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Task Description */}
      <ScrollArea className="flex-1">
        <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {MOCK_MARKDOWN}
          </ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  );
}
