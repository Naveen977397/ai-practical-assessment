import { readFileSync } from "fs";
import { join } from "path";

const spec = readFileSync(join(process.cwd(), "openapi.yaml"), "utf-8");

export default function ApiDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="app-page-title">API Documentation</h1>
        <p className="mt-1 app-muted">
          OpenAPI 3.0 specification for the Support Ticket Management API
        </p>
      </div>
      <div className="app-card space-y-4">
        <p className="text-sm text-slate-700">
          Download the spec or view it in an OpenAPI-compatible tool (Swagger
          Editor, Postman, etc.).
        </p>
        <a href="/api/openapi" className="app-btn-primary inline-flex">
          Download openapi.yaml
        </a>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">
        {spec}
      </pre>
    </div>
  );
}
