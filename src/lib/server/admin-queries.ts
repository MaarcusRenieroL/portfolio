/** A content row has unpublished work when it was never published or its draft differs from the live copy. */
export const PENDING_SQL = "(published is null or draft is distinct from published or draft_de is distinct from published_de)";
