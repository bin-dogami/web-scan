import Link from 'next/link';

const CustomLink = ({ as, href, className, title, children, openBlank }) => {
  return (
    <Link as={as} href={href}>
      <a className={className} title={title} target={openBlank ? '_blank' : '_self'}>{children}</a>
    </Link>
  )
}

export default CustomLink