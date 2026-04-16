import { render, screen } from '@testing-library/react'
import Navbar from '@/components/layout/Navbar'

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Navbar', () => {
  it('renders the site name as logo', () => {
    render(<Navbar />)
    expect(screen.getByText('PangHu')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Navbar />)
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('作品集')).toBeInTheDocument()
    expect(screen.getByText('博客')).toBeInTheDocument()
    expect(screen.getByText('关于')).toBeInTheDocument()
  })

  it('renders mobile menu button', () => {
    render(<Navbar />)
    const button = screen.getByLabelText('Toggle navigation menu')
    expect(button).toBeInTheDocument()
  })
})
