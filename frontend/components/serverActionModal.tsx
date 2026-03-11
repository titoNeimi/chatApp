'use client'

import { ArrowLeft, Link2, Plus } from "lucide-react";
import { useState } from "react";
import { Modal } from "./modal";

type View = "pick" | "create" | "join";

export function ServerActionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>("pick");

  const handleClose = () => {
    onClose();
    setView("pick");
  };

  return (
    <Modal open={open} onClose={handleClose}>
      {view === "pick" && <PickView onSelect={setView} />}
      {view === "create" && <CreateView onBack={() => setView("pick")} onClose={handleClose} />}
      {view === "join" && <JoinView onBack={() => setView("pick")} onClose={handleClose} />}
    </Modal>
  );
}

function PickView({ onSelect }: { onSelect: (v: View) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-textHigh">Add a server</h2>
        <p className="mt-1 text-sm text-textMed">Create your own or join one with a link.</p>
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <OptionCard
          icon={<Plus className="h-5 w-5" />}
          title="Create a Server"
          description="Set up your own community from scratch."
          onClick={() => onSelect("create")}
        />
        <OptionCard
          icon={<Link2 className="h-5 w-5" />}
          title="Join with a Link"
          description="Have an invite link? Jump right in."
          onClick={() => onSelect("join")}
          disabled
        />
      </div>
    </div>
  );
}

function OptionCard({
  icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-4 rounded-xl border border-softBorder bg-deepNavy px-4 py-4 text-left transition hover:border-electricPurple/60 hover:shadow-[0_0_16px_var(--color-purpleGlow)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-softBorder disabled:hover:shadow-none"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-electricPurple/10 text-electricPurple">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-textHigh">{title}</p>
        <p className="text-sm text-textMed">{description}</p>
      </div>
    </button>
  );
}

function CreateView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up create server API call
    onClose();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-textMed transition hover:bg-deepNavy hover:text-textHigh"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-textHigh">Create a Server</h2>
          <p className="text-sm text-textMed">Your community starts here.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Server Name" required>
          <input
            type="text"
            placeholder="My Awesome Server"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-softBorder bg-deepNavy px-3 py-2.5 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_2px_var(--color-purpleGlow)]"
          />
        </Field>

        <Field label="Description">
          <textarea
            placeholder="What's this server about? (optional)"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-lg border border-softBorder bg-deepNavy px-3 py-2.5 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_2px_var(--color-purpleGlow)]"
          />
        </Field>

        <button
          type="submit"
          disabled={!name.trim()}
          className="mt-1 w-full rounded-full bg-electricPurple py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_var(--color-purpleGlow)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Create Server
        </button>
      </form>
    </div>
  );
}

function JoinView({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [link, setLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up join-by-link API call
    onClose();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-textMed transition hover:bg-deepNavy hover:text-textHigh"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-textHigh">Join with a Link</h2>
          <p className="text-sm text-textMed">Paste your invite link below.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Invite Link" required>
          <input
            type="text"
            placeholder="https://chatapp.com/invite/abc123"
            required
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full rounded-lg border border-softBorder bg-deepNavy px-3 py-2.5 text-sm text-textHigh placeholder:text-textMed/50 outline-none transition focus:border-electricPurple focus:shadow-[0_0_0_2px_var(--color-purpleGlow)]"
          />
        </Field>

        <button
          type="submit"
          disabled={!link.trim()}
          className="mt-1 w-full rounded-full bg-electricPurple py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_var(--color-purpleGlow)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Join Server
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-textMed">
        {label}
        {required && <span className="ml-1 text-electricPurple">*</span>}
      </label>
      {children}
    </div>
  );
}
