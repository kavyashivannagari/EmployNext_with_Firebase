export default function Footer() {
    return (
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">EmployNext</h3>
              <p className="text-gray-400">
                Connecting talent with opportunity through innovative technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Candidates</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Browse Jobs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Career Advice</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Salary Calculator</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Post a Job</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Browse Candidates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Recruiting Solutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © {new Date().getFullYear()} JobConnect. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }