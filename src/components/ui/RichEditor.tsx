import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useRef } from 'react'

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

const COLORS = ['#E5E2E1', '#E60014', '#FF6D00', '#FFB300', '#00C853', '#A9C7FF', '#CE93D8', '#80DEEA']

function ToolBtn({ onClick, active, title, children }: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-1.5 rounded text-sm transition-all ${
        active
          ? 'bg-[var(--color-primary)] text-white'
          : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-highest)] hover:text-[var(--color-on-surface)]'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-[var(--color-surface-highest)] mx-0.5 self-center" />
}

export function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: { HTMLAttributes: { class: 'rich-code-block' } } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'rich-link' } }),
      Image.configure({ HTMLAttributes: { class: 'rich-image' } }),
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'rich-youtube' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Escreva o conteúdo da etapa...' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL do link:', prev ?? 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run()
  }, [editor])

  const insertImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL da imagem:', 'https://')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const insertYoutube = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL do vídeo YouTube:', 'https://youtube.com/watch?v=')
    if (!url) return
    editor.commands.setYoutubeVideo({ src: url })
  }, [editor])

  if (!editor) return null

  return (
    <div className="bg-[var(--color-surface-highest)] rounded-xl overflow-hidden border border-[var(--color-surface-highest)] focus-within:border-[var(--color-primary)]/50 transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 bg-[var(--color-surface-low)] border-b border-[var(--color-surface-highest)]">

        {/* History */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
          <span className="material-symbols-rounded text-base">undo</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Refazer">
          <span className="material-symbols-rounded text-base">redo</span>
        </ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Título 1">
          <span className="font-bold text-xs">H1</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Título 2">
          <span className="font-bold text-xs">H2</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Título 3">
          <span className="font-bold text-xs">H3</span>
        </ToolBtn>

        <Divider />

        {/* Inline */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Negrito">
          <span className="material-symbols-rounded text-base">format_bold</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Itálico">
          <span className="material-symbols-rounded text-base">format_italic</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Sublinhado">
          <span className="material-symbols-rounded text-base">format_underlined</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Tachado">
          <span className="material-symbols-rounded text-base">strikethrough_s</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')} title="Código inline">
          <span className="material-symbols-rounded text-base">code</span>
        </ToolBtn>

        <Divider />

        {/* Color */}
        <div className="relative">
          <ToolBtn onClick={() => colorInputRef.current?.click()} title="Cor do texto">
            <span className="material-symbols-rounded text-base">format_color_text</span>
          </ToolBtn>
          <input
            ref={colorInputRef}
            type="color"
            defaultValue="#E5E2E1"
            className="absolute opacity-0 w-0 h-0"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          />
        </div>

        {/* Color presets */}
        <div className="flex gap-0.5">
          {COLORS.map(c => (
            <button key={c} type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run() }}
              title={c} className="w-4 h-4 rounded-sm border border-white/10 flex-shrink-0 hover:scale-110 transition-transform"
              style={{ backgroundColor: c }} />
          ))}
        </div>

        <ToolBtn onClick={() => editor.chain().focus().toggleHighlight({ color: '#FFB30040' }).run()}
          active={editor.isActive('highlight')} title="Destacar">
          <span className="material-symbols-rounded text-base">format_ink_highlighter</span>
        </ToolBtn>

        <Divider />

        {/* Align */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="Alinhar à esquerda">
          <span className="material-symbols-rounded text-base">format_align_left</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="Centralizar">
          <span className="material-symbols-rounded text-base">format_align_center</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="Alinhar à direita">
          <span className="material-symbols-rounded text-base">format_align_right</span>
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Lista com marcadores">
          <span className="material-symbols-rounded text-base">format_list_bulleted</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Lista numerada">
          <span className="material-symbols-rounded text-base">format_list_numbered</span>
        </ToolBtn>

        <Divider />

        {/* Blocks */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Citação">
          <span className="material-symbols-rounded text-base">format_quote</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')} title="Bloco de código">
          <span className="material-symbols-rounded text-base">terminal</span>
        </ToolBtn>

        <Divider />

        {/* Media */}
        <ToolBtn onClick={setLink} active={editor.isActive('link')} title="Inserir link">
          <span className="material-symbols-rounded text-base">link</span>
        </ToolBtn>
        <ToolBtn onClick={insertImage} title="Inserir imagem (URL)">
          <span className="material-symbols-rounded text-base">add_photo_alternate</span>
        </ToolBtn>
        <ToolBtn onClick={insertYoutube} title="Embutir vídeo YouTube">
          <span className="material-symbols-rounded text-base">smart_display</span>
        </ToolBtn>


      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
