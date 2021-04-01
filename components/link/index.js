import Link from 'next/link';

// @TODO: Link 的 replace 也许可以用来解决 page 回退到 book 页不能找到之前的目录位置问题；
// @TODO: 或许 shallow 才是解决上面这个问题的关键？shallow 的作用是 url 更改了，但不会触发 getServerSideProps 等重新请求
const CustomLink = ({ as, href, className, title, children, openBlank, forBidScrollToTop }) => {
  // 禁止跳转后页面跳转到顶部，scroll 默认是true
  const scroll = !forBidScrollToTop
  return (
    <Link as={as} href={href} passHref scroll={scroll}>
      <a className={className} title={title} target={openBlank ? '_blank' : '_self'}>{children}</a>
    </Link>
  )
}

export default CustomLink