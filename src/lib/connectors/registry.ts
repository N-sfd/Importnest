import { upcItemDbConnector } from "./upcitemdb";
import type { SourceConnector } from "./types";

const connectors: Record<string, SourceConnector> = {
  [upcItemDbConnector.sourceId]: upcItemDbConnector,
};

export function getConnector(sourceId: string): SourceConnector {
  const connector = connectors[sourceId];
  if (!connector) throw new Error(`No connector registered for ${sourceId}`);
  return connector;
}

export function listConnectors() {
  return Object.keys(connectors);
}