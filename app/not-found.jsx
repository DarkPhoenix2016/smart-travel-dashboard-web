'use client';
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export default function Error404() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-100">
        <Image src="/art/404-error-img.png" alt="404 error illustration" width={500} height={300} className="w-full max-w-md mx-auto" />
        <h1 className="text-4xl font-extrabold mb-4">Oops! The page was not found.</h1>
        <p className="text-lg text-gray-600 mb-6">
          Or simply leverage the expertise of our consultation team.
        </p>
        <Link href="/" className="btn btn-lg btn-wide btn-outline btn-primary">Go Dashboard</Link>
      </div>
    </>
  );
}
