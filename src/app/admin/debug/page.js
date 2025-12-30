import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default function DebugPage() {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    let files = [];
    let error = null;

    try {
        if (fs.existsSync(uploadDir)) {
            files = fs.readdirSync(uploadDir);
        } else {
            error = 'Directory does not exist: ' + uploadDir;
        }
    } catch (e) {
        error = e.message;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Debug Uploads</h1>
            <p className="mb-2"><strong>CWD:</strong> {process.cwd()}</p>
            <p className="mb-4"><strong>Upload Dir:</strong> {uploadDir}</p>

            {error && <div className="bg-red-100 p-4 rounded text-red-700 mb-4">{error}</div>}

            <h2 className="text-xl font-bold mb-2">Files ({files.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {files.map(f => (
                    <div key={f} className="border p-2 rounded">
                        <p className="text-xs break-all mb-2">{f}</p>
                        <img
                            src={`/uploads/${f}`}
                            alt={f}
                            className="w-full h-32 object-contain bg-gray-100"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
