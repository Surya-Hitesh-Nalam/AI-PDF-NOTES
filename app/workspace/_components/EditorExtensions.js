import { chatSession } from '@/configs/AIModel';
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs';
import { useAction, useMutation } from 'convex/react'
import { Bold, Italic, Sparkle } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner';

function EditorExtensions({editor, fileId}) {
    // Remove the duplicate fileId declaration - use the prop instead
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
                fileId: fileId, // Using the fileId prop
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
            
            // Fixed: declare FinalAns with let/const
            const FinalAns = AIModelResult.response.text()
                .replace(/```html/g, '')
                .replace(/```/g, '');

            const AllText = editor.getHTML();
            editor.commands.setContent(AllText + '<p> <strong>Answer: </strong>' + FinalAns + '</p>')
            
            await saveNotes({
                notes: editor.getHTML(),
                fileId: fileId, // Using the fileId prop
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
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'text-blue-500' : ''}
                    >
                        <Bold/>
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'text-blue-500' : ''}
                    >
                        <Italic/>
                    </button>
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