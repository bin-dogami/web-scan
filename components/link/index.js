import Link from 'next/link';

const CustomLink = ({ as, href, className, title, children }) => {
  return (
    <Link as={as} href={href}>
      <a className={className} title={title}>{children}</a>
    </Link>
  )
}

export default CustomLink