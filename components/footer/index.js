import { observer, inject } from 'mobx-react';
import Nav from '@@/nav/index'
import Link from '@@/link/index'

const Footer = ({ store: { common } }) => {
  const onSuggest = () => {
  }
  const onGoTop = () => {
    const top = document.querySelector('.top');
    if (top && top.scrollIntoView) {
      top.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }

  return (
    <footer>
      <Nav>
        <span onClick={onGoTop}>回到顶部</span>
      </Nav>
      <div className="thks hide">
        <p>感谢支持<strong><Link href="/" title={common.siteName}>{common.siteName}</Link></strong>网。如有问题，请<a onClick={onSuggest}>给我们提建议</a></p>
      </div>
    </footer>
  )
}

export default inject('store')(observer(Footer))