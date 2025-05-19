export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img className="h-8 w-8" src="/logo.png" alt="Logo" />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-8">
                <a href="#" className="text-gray-700 hover:text-blue-500">
                  Home
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-500">
                  About
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-500">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
