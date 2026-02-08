import Link from "next/link";

export default function Home() {
  const buttonClass = "py-2 px-6 my-5 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg";
  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen flex flex-col items-center justify-center text-dark dark:text-white">
      <h1 className="text-2xl">Welcome to ChatApp</h1>
      <p>A simple real time chat application built with Next.js and Go.</p>
      <div className="flex gap-5">
        <Link href={"/login"} className={`${buttonClass} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white`}>Log in</Link>
        <Link href={"/register"} className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600`}>Sign up</Link>
      </div>
    </section>
  );
}
