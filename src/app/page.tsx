import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center space-y-3 p-6" >
      <h1 className="text-3xl font-bold txt">🎉 Bienvenido</h1>
     
      <p className="mt-4">👰‍♀️🤵🏻‍♂️ </p>
      <p>Esta es la página principal de las bodas</p>
       <Link href="/test" className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded">
        🚀 Ir a la página de prueba
      </Link> 
    </div>
  );
}
