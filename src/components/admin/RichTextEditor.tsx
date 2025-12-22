import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Code,
  Code2
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  dir?: 'rtl' | 'ltr';
}

export function RichTextEditor({ 
  value, 
  onChange, 
  className,
  dir = 'rtl'
}: RichTextEditorProps) {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none',
          dir === 'rtl' ? 'text-right' : 'text-left'
        ),
        dir: dir,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
    if (value !== sourceCode && !isSourceMode) {
      setSourceCode(value);
    }
  }, [value, editor]);

  const handleSourceModeToggle = () => {
    if (isSourceMode) {
      // Switching from source to editor - update editor with source code
      editor?.commands.setContent(sourceCode);
    } else {
      // Switching from editor to source - get HTML from editor
      setSourceCode(editor?.getHTML() || '');
    }
    setIsSourceMode(!isSourceMode);
  };

  const handleSourceCodeChange = (newCode: string) => {
    setSourceCode(newCode);
    onChange(newCode);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-md border">
        {/* Text Formatting */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        
        <div className="w-px h-6 bg-border mx-1 self-center" />
        
        {/* Headings */}
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        
        <div className="w-px h-6 bg-border mx-1 self-center" />
        
        {/* Alignment */}
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          aria-label="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          aria-label="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          aria-label="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        
        <div className="w-px h-6 bg-border mx-1 self-center" />
        
        {/* Lists */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        
        <div className="w-px h-6 bg-border mx-1 self-center" />
        
        {/* Code */}
        <Toggle
          size="sm"
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          aria-label="Code"
          disabled={isSourceMode}
        >
          <Code className="h-4 w-4" />
        </Toggle>
        
        <div className="flex-1" />
        
        {/* Source Code Mode Toggle */}
        <Toggle
          size="sm"
          pressed={isSourceMode}
          onPressedChange={handleSourceModeToggle}
          aria-label="Source Code"
          className="bg-primary/10 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          <Code2 className="h-4 w-4" />
        </Toggle>
        
        <div className="w-px h-6 bg-border mx-1 self-center" />
        
        {/* Undo/Redo */}
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </Toggle>
      </div>
      
      {/* Editor Content or Source Code */}
      {isSourceMode ? (
        <Textarea
          value={sourceCode}
          onChange={(e) => handleSourceCodeChange(e.target.value)}
          className="font-mono text-sm min-h-[120px] resize-y"
          dir="ltr"
          placeholder="<h1>أدخل كود HTML هنا...</h1>"
        />
      ) : (
        <EditorContent 
          editor={editor} 
          className="[&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:focus:outline-none"
        />
      )}
      
      {/* HTML Preview hint */}
      <p className="text-xs text-muted-foreground">
        {isSourceMode 
          ? 'وضع HTML: يمكنك كتابة أو لصق كود HTML مباشرة' 
          : 'يدعم HTML: عناوين، قوائم، محاذاة النص، تنسيق النص - اضغط </> للتبديل لوضع HTML'
        }
      </p>
    </div>
  );
}
