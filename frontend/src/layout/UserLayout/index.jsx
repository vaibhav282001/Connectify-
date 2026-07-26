import React from 'react'
import NavBarComponent from '@/Components/NavBar'

function UserLayout({ children }) {
  return (
    <div>
        <NavBarComponent />
        {children}
    </div>
  )
}

export default UserLayout