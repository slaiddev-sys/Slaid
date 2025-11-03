export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Slaid AI is Working!</h1>
        <p className="text-lg text-gray-600">Server is running successfully</p>
        <div className="mt-8">
          <a href="/" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
