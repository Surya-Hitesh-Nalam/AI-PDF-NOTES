import { chatSession } from '@/configs/AIModel';
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs';
import { useAction, useMutation } from 'convex/react'
import { 
  Bold, 
  Italic, 
  Sparkle, 
  Underline, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Code 
} from 'lucide-react'
import React from 'react'
import { toast } from 'sonner';

function EditorExtensions({editor, fileId}) {
    const SearchAI = useAction(api.myAction.search)
    const saveNotes = useMutation(api.notes.AddNotes)
    const {user} = useUser()

    const onAIClick = async() => {
        toast('AI is working on your answer')
        
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            ' '
        )
        console.log(selectedText)

        try {
            const result = await SearchAI({
                query: selectedText,
                fileId: fileId,
            })

            const UnformatedAns = JSON.parse(result);
            let AllUnformatedAns = ''
            UnformatedAns && UnformatedAns.forEach(item => {
                AllUnformatedAns += item.pageContent
            });

            const PROMPT = "For question: " + selectedText + " and with given content as answer, " +
            "please give appropriate answer in HTML format. The answer content is: " + AllUnformatedAns;

            const AIModelResult = await chatSession.sendMessage(PROMPT)
            console.log(AIModelResult.response.text())
            
            const FinalAns = AIModelResult.response.text()
                .replace(/```html/g, '')
                .replace(/```/g, '');

            const AllText = editor.getHTML();
            editor.commands.setContent(AllText + '<p> <strong>Answer: </strong>' + FinalAns + '</p>')
            
            await saveNotes({
                notes: editor.getHTML(),
                fileId: fileId,
                createdBy: user?.primaryEmailAddress?.emailAddress
            })

            toast.success('AI answer added successfully!')
        } catch (error) {
            console.error('AI processing error:', error)
            toast.error('Failed to get AI answer')
        }
    }

    return editor && (
        <div className='p-5'>
            <div className="control-group">
                <div className="button-group flex gap-3">
                    {/* Bold */}
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'text-blue-500' : ''}
                    >
                        <Bold/>
                    </button>

                    {/* Italic */}
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'text-blue-500' : ''}
                    >
                        <Italic/>
                    </button>

                    {/* Underline */}
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={editor.isActive('underline') ? 'text-blue-500' : ''}
                    >
                        <Underline/>
                    </button>

                    {/* Headings */}
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'text-blue-500' : ''}
                    >
                        <Heading1/>
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'text-blue-500' : ''}
                    >
                        <Heading2/>
                    </button>

                    {/* Lists */}
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'text-blue-500' : ''}
                    >
                        <List/>
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'text-blue-500' : ''}
                    >
                        <ListOrdered/>
                    </button>

                    {/* Blockquote */}
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editor.isActive('blockquote') ? 'text-blue-500' : ''}
                    >
                        <Quote/>
                    </button>

                    {/* Code Block */}
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={editor.isActive('codeBlock') ? 'text-blue-500' : ''}
                    >
                        <Code/>
                    </button>

                    {/* AI Answer */}
                    <button
                        onClick={() => onAIClick()}
                        className={'hover:text-blue-500'}
                    >
                        <Sparkle/>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditorExtensions
