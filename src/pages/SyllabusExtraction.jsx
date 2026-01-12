// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Upload, FileText, Check, Loader2, Plus, ArrowRight, AlertCircle, Key } from 'lucide-react';
import { useAssignments } from '../context/AssignmentContext';
import { useNavigate } from 'react-router-dom';
import { extractTextFromPdf } from '../lib/pdf-utils';
import { parseSyllabusWithLLM } from '../lib/llm-service';

const SyllabusExtraction = () => {
  const { addAssignment } = useAssignments();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Upload, 2: Processing, 3: Review
  const [text, setText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    try {
      if (file.type === 'application/pdf') {
        const extractedText = await extractTextFromPdf(file);
        setText(extractedText);
      } else {
        // Plain text fallback
        const textContent = await file.text();
        setText(textContent);
      }
    } catch {
      setError("Failed to read file. Please paste text manually.");
    }
  };

  const handleExtraction = async () => {
    if (!text.trim()) return;
    if (!apiKey.trim()) {
      setError("Please enter an OpenAI API Key.");
      return;
    }
    
    setStep(2);
    setIsProcessing(true);
    setError(null);

    try {
      const data = await parseSyllabusWithLLM(text, apiKey);
      
      if (!data.assignments || !Array.isArray(data.assignments)) {
        throw new Error("Invalid response format from AI.");
      }

      setParsedData(data.assignments);
      setStep(3);
    } catch (err) {
      setError(err.message || "Failed to extract syllabus data.");
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    // Basic Validation: Check if weights look crazy
    const totalWeight = parsedData.reduce((sum, a) => sum + (a.weight || 0), 0);
    if (totalWeight > 120) {
      if (!confirm(`Total weight is ${totalWeight}%. Are you sure this is correct?`)) {
        return;
      }
    }

    parsedData.forEach(a => addAssignment(a));
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">AI Syllabus Extraction</h2>
        <p className="text-muted-foreground">Upload your syllabus and let Pika organize your semester.</p>
      </header>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 text-sm font-medium">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary/10' : 'border-muted'}`}>1</div>
          Upload
        </div>
        <div className="w-12 h-px bg-border" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary/10' : 'border-muted'}`}>2</div>
          Process
        </div>
        <div className="w-12 h-px bg-border" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-primary bg-primary/10' : 'border-muted'}`}>3</div>
          Review
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 min-h-[400px] flex flex-col justify-center">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="relative group">
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center group-hover:bg-muted/30 transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-lg font-medium">Drop your syllabus PDF here</p>
                <p className="text-sm text-muted-foreground mt-2">or click to browse files</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or paste text</span></div>
            </div>

            <textarea
              className="w-full h-32 bg-background border border-border rounded-lg p-4 focus:ring-2 focus:ring-primary focus:outline-none resize-none text-sm font-mono"
              placeholder="Paste course schedule or syllabus text here..."
              value={text}
              onChange={e => setText(e.target.value)}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="w-4 h-4" /> OpenAI API Key <span className="text-muted-foreground font-normal">(Required for extraction)</span>
              </label>
              <input 
                type="password" 
                value={apiKey}
                disabled={isProcessing}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleExtraction}
              disabled={!text.trim() || !apiKey.trim()}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Analyze Syllabus <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Analyzing Content...</h3>
              <p className="text-muted-foreground mt-2">Connecting to LLM and parsing structure.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" /> Extraction Complete
              </h3>
              <span className="text-sm text-muted-foreground">{parsedData.length} items found</span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {parsedData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-background p-2 rounded-md border border-border">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.type} • {item.weight}%</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div>{new Date(item.due_date).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">{item.estimated_hours}h est.</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-lg font-medium border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Import to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusExtraction;
