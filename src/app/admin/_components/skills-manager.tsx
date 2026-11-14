"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addSkill, removeSkillFromGroup } from "../actions";
import { PlusIcon } from "./icons";

export function AddSkillDialog({
  groups,
  defaultGroup,
  trigger,
}: {
  groups: string[];
  defaultGroup?: string;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(defaultGroup ?? (groups[0] || ""));
  const [customGroup, setCustomGroup] = useState("");
  const [isNewGroup, setIsNewGroup] = useState(groups.length === 0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const finalGroup = isNewGroup ? customGroup.trim() : selectedGroup.trim();

    if (!skillName.trim()) {
      setErr("Please enter a skill name.");
      return;
    }
    if (!finalGroup) {
      setErr("Please select or enter a group name.");
      return;
    }

    setBusy(true);
    const res = await addSkill(skillName, finalGroup);
    setBusy(false);

    if (res.ok) {
      setSkillName("");
      setCustomGroup("");
      setOpen(false);
      router.refresh();
    } else {
      setErr(res.errors.join(" "));
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => { setOpen(true); setErr(""); }}>{trigger}</span>
      ) : (
        <button
          type="button"
          className="btn ghost"
          onClick={() => { setOpen(true); setErr(""); }}
          style={{ gap: 6 }}
        >
          <PlusIcon width={14} height={14} />
          <span>Add skill</span>
        </button>
      )}

      {open && (
        <div className="tablecn-modal-backdrop" onClick={() => setOpen(false)}>
          <div className="tablecn-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="tablecn-modal-header">
              <h3>Add Skill</h3>
              <button
                type="button"
                className="tablecn-clear-btn"
                onClick={() => setOpen(false)}
                title="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="tablecn-modal-form">
              <label>
                Skill Name
                <input
                  type="text"
                  placeholder="e.g. Docker, TypeScript, PostgreSQL"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  autoFocus
                  required
                />
              </label>

              <label>
                Skill Group
                {!isNewGroup && groups.length > 0 ? (
                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      if (e.target.value === "__NEW__") {
                        setIsNewGroup(true);
                      } else {
                        setSelectedGroup(e.target.value);
                      }
                    }}
                  >
                    {groups.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    <option value="__NEW__">+ Create a new group...</option>
                  </select>
                ) : (
                  <div className="row" style={{ gap: 6 }}>
                    <input
                      type="text"
                      placeholder="e.g. DevOps, Cloud & Tools"
                      value={customGroup}
                      onChange={(e) => setCustomGroup(e.target.value)}
                      required
                    />
                    {groups.length > 0 && (
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "6px 10px", fontSize: 11 }}
                        onClick={() => setIsNewGroup(false)}
                      >
                        Choose existing
                      </button>
                    )}
                  </div>
                )}
              </label>

              {err && <p className="err" style={{ margin: "4px 0" }}>{err}</p>}

              <div className="row" style={{ justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={busy}>
                  {busy ? "Saving..." : "Add Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function SkillRowChips({
  groupName,
  items,
  allGroups,
}: {
  groupName: string;
  items: string[];
  allGroups: string[];
}) {
  const router = useRouter();
  const [busySkill, setBusySkill] = useState<string | null>(null);

  const handleRemove = async (skill: string) => {
    if (confirm(`Remove "${skill}" from "${groupName}"?`)) {
      setBusySkill(skill);
      const res = await removeSkillFromGroup(skill, groupName);
      setBusySkill(null);
      if (res.ok) {
        router.refresh();
      } else {
        alert(res.errors.join(" "));
      }
    }
  };

  return (
    <div className="tablecn-skills-chips">
      {items.map((skill) => (
        <span
          key={skill}
          className={`tablecn-skill-chip ${busySkill === skill ? "busy" : ""}`}
        >
          {skill}
          <button
            type="button"
            className="tablecn-skill-chip-del"
            title={`Remove ${skill}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove(skill);
            }}
          >
            ×
          </button>
        </span>
      ))}

      <AddSkillDialog
        groups={allGroups}
        defaultGroup={groupName}
        trigger={
          <button
            type="button"
            className="tablecn-skill-chip-add"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            title={`Add a skill to ${groupName}`}
          >
            + Add skill
          </button>
        }
      />
    </div>
  );
}
