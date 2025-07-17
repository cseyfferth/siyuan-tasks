import { lsNotebooks, getHPathByID } from "../api";
import { Notebook } from "../types/tasks";

export class NotebookService {
  private static notebooksCache: Notebook[] = [];

  /**
   * Get notebook name by box ID
   */
  static async getNotebookName(boxId: string): Promise<string> {
    if (this.notebooksCache.length === 0) {
      await this.loadNotebooks();
    }

    const notebook = this.notebooksCache.find((nb) => nb.id === boxId);
    return notebook ? notebook.name : "Unknown Notebook";
  }

  /**
   * Get document path by document ID
   */
  static async getDocumentPath(docId: string): Promise<string> {
    if (!docId) return "Unknown Document";

    try {
      const response = await getHPathByID(docId);
      if (!response) return "Unknown Document";

      // Remove leading "/" if present
      return response.startsWith("/") ? response.slice(1) : response;
    } catch (err) {
      console.error("Error fetching document path:", err);
      return "Error/Unknown Document";
    }
  }

  /**
   * Load notebooks from the API
   */
  private static async loadNotebooks(): Promise<void> {
    try {
      const response = await lsNotebooks();
      this.notebooksCache = response.notebooks || [];
    } catch (err) {
      console.error("Error fetching notebooks:", err);
      this.notebooksCache = [];
    }
  }

  /**
   * Get notebook icon by box ID
   */
  static async getNotebookIcon(boxId: string): Promise<string> {
    if (this.notebooksCache.length === 0) {
      await this.loadNotebooks();
    }

    const notebook = this.notebooksCache.find((nb) => nb.id === boxId);
    if (!notebook?.icon) return "🗃";

    // Convert Unicode code point to emoji
    return this.convertUnicodeToEmoji(notebook.icon);
  }

  /**
   * Convert Unicode code point to emoji character
   * Examples: "1f970" -> "🥰", "1f4d3" -> "📓"
   */
  private static convertUnicodeToEmoji(unicode: string): string {
    try {
      // Handle different formats
      let codePoint: string;

      if (unicode.startsWith("1f")) {
        // Format: "1f970" -> "🥰"
        codePoint = unicode;
      } else if (unicode.startsWith("U+1f")) {
        // Format: "U+1f970" -> "🥰"
        codePoint = unicode.substring(2);
      } else if (unicode.startsWith("\\u")) {
        // Format: "\\u1f970" -> "🥰"
        codePoint = unicode.substring(2);
      } else {
        // Assume it's already an emoji or unknown format
        return unicode;
      }

      // Convert hex code point to emoji
      const emoji = String.fromCodePoint(parseInt(codePoint, 16));
      return emoji;
    } catch (error) {
      console.warn(`Failed to convert Unicode ${unicode} to emoji:`, error);
      return "🗃"; // Fallback to default icon
    }
  }

  /**
   * Clear the notebooks cache (useful for testing or when data might be stale)
   */
  static clearCache(): void {
    this.notebooksCache = [];
  }

  /**
   * Get all notebooks (for debugging or other uses)
   */
  static getNotebooks(): Notebook[] {
    return [...this.notebooksCache];
  }
}
