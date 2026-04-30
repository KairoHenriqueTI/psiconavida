import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { ArrowLeft, Bold, Heading1, Heading2, Heading3, Italic, Link2, List, ListOrdered, Pilcrow, Quote, RemoveFormatting, Redo2, Undo2 } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

const API = API_BASE;

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    category_id: "",
    read_time: "5 min",
    published: false,
    date: new Date().toISOString().split("T")[0],
  });
  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/categories`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.json();
    },
  });

  const { data: existingPost } = useQuery({
    queryKey: ["admin-post", id],
    enabled: !isNew && !!id,
    queryFn: async () => {
      const res = await fetch(`${API}/api/posts/${id}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
  });

  useEffect(() => {
    if (existingPost) {
      const content = existingPost.content || "";
      setForm({
        title: existingPost.title,
        slug: existingPost.slug,
        excerpt: existingPost.excerpt || "",
        content,
        image: existingPost.image || "",
        category_id: existingPost.category?.id || existingPost.categoryId || "",
        read_time: existingPost.read_time || "5 min",
        published: existingPost.published,
        date: existingPost.date ? existingPost.date.split("T")[0] : new Date().toISOString().split("T")[0],
      });
      contentRef.current = content;
      if (editorRef.current && editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [existingPost]);

  useEffect(() => {
    if (!isNew) return;
    contentRef.current = "";
    if (editorRef.current) editorRef.current.innerHTML = "";
  }, [isNew]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const content = normalizeEditorHtml(contentRef.current || editorRef.current?.innerHTML || "")
        .replace(/<p><br><\/p>/g, "")
        .trim();
      const payload: any = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content,
        image: form.image.trim(),
        categoryId: form.category_id || null,
        read_time: form.read_time.trim(),
        published: !!form.published,
        date: new Date(form.date).toISOString(),
      };

      if (isNew) {
        const res = await fetch(`${API}/api/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error?.error || 'Não foi possível criar a publicação.');
        }
      } else {
        const res = await fetch(`${API}/api/posts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error?.error || 'Não foi possível atualizar a publicação.');
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success(isNew ? "Publicação criada!" : "Publicação atualizada!");
      navigate("/admin/posts");
    },
    onError: (err: Error) => {
      toast.error("Erro: " + err.message);
    },
  });

  const update = (key: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && (isNew || prev.slug === slugify(prev.title))) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const normalizeEditorHtml = (html: string) => {
    return html
      .replace(/<div><br><\/div>/g, "<p></p>")
      .replace(/<div>/g, "<p>")
      .replace(/<\/div>/g, "</p>")
      .replace(/<span(?![^>]*class="editor-inline-heading editor-inline-h[123]")[^>]*>/g, "")
      .replace(/<p class="editor-placeholder">.*?<\/p>/g, "");
  };

  const syncEditorContent = (normalize = false) => {
    const el = editorRef.current;
    if (!el) return "";
    const next = normalize ? normalizeEditorHtml(el.innerHTML) : el.innerHTML;
    if (normalize && el.innerHTML !== next) el.innerHTML = next;
    contentRef.current = next;
    setForm((prev) => (prev.content === next ? prev : { ...prev, content: next }));
    return next;
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorContent();
  };

  const getEditorSelection = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection || !editor || selection.rangeCount === 0 || selection.isCollapsed) return null;
    const anchor = selection.anchorNode;
    const focus = selection.focusNode;
    if (!anchor || !focus || !editor.contains(anchor) || !editor.contains(focus)) return null;
    return selection;
  };

  const applyInlineHeading = (level: "h1" | "h2" | "h3") => {
    const selection = getEditorSelection();
    if (!selection) return false;
    const range = selection.getRangeAt(0);
    const selected = range.extractContents();
    const span = document.createElement("span");
    span.className = `editor-inline-heading editor-inline-${level}`;
    span.appendChild(selected);
    range.insertNode(span);
    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    selection.addRange(nextRange);
    syncEditorContent();
    return true;
  };

  const heading = (level: "p" | "h1" | "h2" | "h3" | "blockquote") => {
    if ((level === "h1" || level === "h2" || level === "h3") && applyInlineHeading(level)) return;
    if (level === "p" && getEditorSelection()) {
      exec("removeFormat");
      return;
    }
    exec("formatBlock", `<${level}>`);
  };
  const keepEditorFocus = (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault();

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate("/admin/posts")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Voltar
      </button>

      <h1 className="font-heading text-2xl text-foreground mb-6">
        {isNew ? "Nova Publicação" : "Editar Publicação"}
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-subtitle text-foreground block mb-1.5">Título</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-subtitle text-foreground block mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              required
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-subtitle text-foreground block mb-1.5">Resumo</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            rows={2}
            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring resize-y"
          />
        </div>

        <div>
          <label className="text-sm font-subtitle text-foreground block mb-1.5">Conteúdo</label>
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="sticky top-0 z-10 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur">
              <div className="flex flex-wrap gap-2">
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => heading("p")} className="editor-toolbar-btn"><Pilcrow size={14} />Parágrafo</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => heading("h1")} className="editor-toolbar-btn"><Heading1 size={14} />H1</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => heading("h2")} className="editor-toolbar-btn"><Heading2 size={14} />H2</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => heading("h3")} className="editor-toolbar-btn"><Heading3 size={14} />H3</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => exec("bold")} className="editor-toolbar-btn"><Bold size={14} />Negrito</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => exec("italic")} className="editor-toolbar-btn"><Italic size={14} />Itálico</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => exec("insertUnorderedList")} className="editor-toolbar-btn"><List size={14} />Lista</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => exec("insertOrderedList")} className="editor-toolbar-btn"><ListOrdered size={14} />Lista numerada</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => heading("blockquote")} className="editor-toolbar-btn"><Quote size={14} />Citação</button>
                <button type="button" onClick={() => {
                  const url = window.prompt("URL do link");
                  if (url) exec("createLink", url);
                }} onMouseDown={keepEditorFocus} className="editor-toolbar-btn"><Link2 size={14} />Link</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => exec("removeFormat")} className="editor-toolbar-btn"><RemoveFormatting size={14} />Limpar</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => exec("undo")} className="editor-toolbar-btn"><Undo2 size={14} />Desfazer</button>
                <button type="button" onMouseDown={keepEditorFocus} onClick={() => exec("redo")} className="editor-toolbar-btn"><Redo2 size={14} />Refazer</button>
              </div>
            </div>
            <div className="editor-canvas">
              <div
                id="rich-editor"
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Escreva aqui o conteúdo da publicação..."
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");
                  document.execCommand("insertText", false, text);
                  syncEditorContent();
                }}
                onBlur={() => syncEditorContent(true)}
                onInput={() => {
                  contentRef.current = editorRef.current?.innerHTML || "";
                }}
                className="editor-surface"
              />
            </div>
          </div>
        </div>

        <ImageUpload
          label="Imagem de capa"
          value={form.image}
          onChange={(url) => update("image", url)}
          folder="posts"
        />

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-subtitle text-foreground block mb-1.5">Categoria</label>
            <select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Sem categoria</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-subtitle text-foreground block mb-1.5">Tempo de leitura</label>
            <input
              value={form.read_time}
              onChange={(e) => update("read_time", e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-subtitle text-foreground block mb-1.5">Data</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">Publicar</span>
          </label>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            O autor da publicação é definido pelo usuário logado no momento do salvamento.
          </p>
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="bg-primary text-primary-foreground font-subtitle text-sm px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
