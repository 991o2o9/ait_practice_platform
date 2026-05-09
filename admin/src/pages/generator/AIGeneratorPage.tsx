import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Check, Sparkles } from 'lucide-react';
import { aiApi } from '@/entities/admin/api/aiApi';
import type { DraftResponse } from '@/entities/admin/api/aiApi';
import { toast } from 'sonner';

export function AIGeneratorPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  
  const [feedback, setFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await aiApi.generateDraft(prompt);
      setDraft(result);
      setStep(2);
      toast.success('Draft generated successfully!');
    } catch (err: any) {
      toast.error('Failed to generate project: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!feedback.trim() || !draft) return;
    setIsRefining(true);
    try {
      const result = await aiApi.refineDraft(draft, feedback);
      setDraft(result);
      setFeedback('');
      toast.success('Draft refined successfully!');
    } catch (err: any) {
      toast.error('Failed to refine project: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsRefining(false);
    }
  };

  const handlePublish = async () => {
    if (!draft) return;
    setIsPublishing(true);
    try {
      await aiApi.publishProject(draft);
      toast.success('Project published successfully!');
      // Сбрасываем стейт
      setDraft(null);
      setPrompt('');
      setStep(1);
    } catch (err: any) {
      toast.error('Failed to publish project: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-indigo-400" />
            AI Project Generator
          </h1>
          <p className="text-zinc-400 mt-2">Create new practice projects instantly using AI.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-zinc-800 text-zinc-400'}`}>1. Prompt</div>
          <div className="h-px w-8 bg-zinc-800" />
          <div className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-zinc-800 text-zinc-400'}`}>2. Review & Publish</div>
        </div>
      </div>

      {step === 1 && (
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden relative">
          {/* Decorative gradient */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          <CardHeader>
            <CardTitle className="text-zinc-100">What do you want to build?</CardTitle>
            <CardDescription className="text-zinc-400">
              Describe the project, its core mechanics, and the technologies involved. The AI will generate a complete step-by-step curriculum.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="e.g. Create a backend for a Ride-Sharing app like Uber. Include models for Users, Drivers, and Rides. Add tasks for calculating fares and matching drivers..."
              className="min-h-[200px] bg-zinc-950 border-zinc-800 text-zinc-100 resize-none text-base p-4 focus-visible:ring-indigo-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-end border-t border-zinc-800/50 pt-6">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()} 
              className="gap-2 px-8 h-12 text-md"
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
              {isGenerating ? 'Generating Curriculum...' : 'Generate Project'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && draft && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="border-b border-zinc-800/50">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-2xl text-zinc-100">{draft.project_title}</CardTitle>
                  <CardDescription className="text-zinc-400 mt-2 text-base leading-relaxed">
                    {draft.project_description}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shrink-0">
                  {draft.tasks.length} Tasks Generated
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-zinc-200 mb-4">Curriculum Outline</h3>
              {/* @ts-expect-error Accordion type might not be fully defined */}
              <Accordion type="multiple" className="space-y-3">
                {draft.tasks.map((task, idx) => (
                  <AccordionItem key={idx} value={`task-${idx}`} className="border-zinc-800 bg-zinc-950/50 rounded-lg overflow-hidden border px-1">
                    <AccordionTrigger className="hover:no-underline px-4 py-3">
                      <div className="flex items-center gap-3 text-left">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-zinc-200">{task.title}</span>
                        <Badge variant={task.difficulty === 'easy' ? 'secondary' : task.difficulty === 'medium' ? 'default' : 'destructive'} className="ml-auto text-[10px] capitalize">
                          {task.difficulty}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-1">
                      <div className="space-y-4">
                        {task.hints && (
                          <div className="p-3 bg-zinc-900 rounded-md border border-zinc-800">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider mb-1 block">Task Description / Hints</Label>
                            <p className="text-sm text-zinc-300">{task.hints}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Solution Template</Label>
                            <div className="bg-[#1e1e1e] rounded-md p-3 font-mono text-xs text-zinc-300 overflow-x-auto border border-zinc-800">
                              <pre><code>{task.solution_template || '# Empty template'}</code></pre>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-zinc-400 text-xs uppercase tracking-wider">Test Code</Label>
                            <div className="bg-[#1e1e1e] rounded-md p-3 font-mono text-xs text-zinc-300 overflow-x-auto border border-zinc-800">
                              <pre><code>{task.test_code || '# No tests provided'}</code></pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Need changes?</CardTitle>
                <CardDescription>Tell the AI what to improve or modify in the current draft.</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Input 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Make task 3 harder, or add a task for creating an API endpoint..."
                  className="bg-zinc-950 border-zinc-800 text-white"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRefine() }}
                />
                <Button onClick={handleRefine} disabled={isRefining || !feedback.trim()} variant="secondary">
                  {isRefining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refine'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-900/40 to-zinc-900 border-indigo-500/20 flex flex-col justify-center items-center text-center p-6">
              <h3 className="font-semibold text-zinc-100 mb-2">Looks Good?</h3>
              <p className="text-sm text-zinc-400 mb-6">Publish this project immediately to the platform for users to practice.</p>
              <Button onClick={handlePublish} disabled={isPublishing} className="w-full h-12">
                {isPublishing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                Publish Project
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
