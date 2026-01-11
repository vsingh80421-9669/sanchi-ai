export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="px-4 py-2 bg-black text-white rounded" {...props} />
  )
}
