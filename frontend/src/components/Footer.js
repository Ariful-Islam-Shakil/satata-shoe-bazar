import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              SATATA SHOE BAZAR
            </Link>
            <p className="mt-4 text-gray-500 text-sm">
              Providing premium quality shoes with the best comfort in Bangladesh. 
              Authenticity and customer satisfaction are our top priorities.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/shop?category=Sneakers" className="text-sm text-gray-500 hover:text-gray-900">Sneakers</Link></li>
              <li><Link href="/shop?category=Formal" className="text-sm text-gray-500 hover:text-gray-900">Formal Shoes</Link></li>
              <li><Link href="/shop?category=Boots" className="text-sm text-gray-500 hover:text-gray-900">Boots</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-500">Dhaka, Bangladesh</li>
              <li className="text-sm text-gray-500">Phone: +880 1XXX XXXXXX</li>
              <li className="text-sm text-gray-500">Email: info@satatashoe.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 flex justify-between items-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Satata Shoe Bazar. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="text-xs text-gray-400 uppercase tracking-widest">Cash on Delivery Only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
