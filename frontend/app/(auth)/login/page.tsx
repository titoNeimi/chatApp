'use client'

import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState<{email:string, password:string}>({ email: '', password: '' });

  const handleChage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   try {
  //     const res = await fetch("api/auth/")
  //   } catch (error) {
      
  //   }
  // }

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center text-dark dark:text-white">
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl text-center">Log in</h2>
        <form action="">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium">Email</label>
            <input onChange={handleChage} type="email" id="email" name="email" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-400" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="password" className="font-medium">Password</label>
            <input onChange={handleChage} type="password" id="password" name="password" required className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-400" />
          </div>
          <button type="submit" className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-200">Log in</button>
        </form>
      </div>
    </section>
  );
}