import { AGENT_TREE } from "@/lib/tutorial";

type TreeNode = {
  name: string;
  kind: "file" | "dir";
  highlightId?: string;
  children?: TreeNode[];
};

type AgentDirectoryProps = {
  activeId?: string | null;
  className?: string;
};

function TreeItems({
  nodes,
  activeId,
  depth = 0,
}: {
  nodes: TreeNode[];
  activeId?: string | null;
  depth?: number;
}) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => {
        const isActive =
          !!activeId &&
          (node.highlightId === activeId ||
            (node.kind === "dir" &&
              node.children?.some(
                (child) =>
                  child.highlightId === activeId ||
                  child.children?.some((c) => c.highlightId === activeId)
              )));

        const selfActive = !!activeId && node.highlightId === activeId;

        return (
          <li key={`${depth}-${node.name}`}>
            <div
              className={`rounded-md px-2 py-1 font-mono text-[13px] transition-colors duration-200 ${
                selfActive
                  ? "bg-fg/10 text-fg"
                  : isActive && node.kind === "dir"
                    ? "text-fg"
                    : "text-fg-muted"
              }`}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
            >
              <span className="mr-2 text-fg-muted/70 select-none">
                {node.kind === "dir" ? "▾" : "·"}
              </span>
              {node.name}
            </div>
            {node.children ? (
              <TreeItems
                nodes={node.children}
                activeId={activeId}
                depth={depth + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function AgentDirectory({
  activeId = null,
  className = "",
}: AgentDirectoryProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-panel p-3 ${className}`}
    >
      <div className="mb-3 border-b border-border px-2 pb-2 font-mono text-xs text-fg-muted">
        my-agent/
      </div>
      <TreeItems nodes={AGENT_TREE as TreeNode[]} activeId={activeId} />
    </div>
  );
}
