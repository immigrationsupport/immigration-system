import * as React from "react"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost',
    size?: 'default' | 'sm' | 'lg' | 'icon',
    fullWidth?: boolean
}>(
    ({ className, variant = 'primary', size = 'default', fullWidth, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"

        let variantStyles = ""
        switch (variant) {
            case 'primary':
                variantStyles = "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm"
                break
            case 'secondary':
                variantStyles = "bg-gray-100 text-gray-900 hover:bg-gray-200/80"
                break
            case 'outline':
                variantStyles = "border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                break
            case 'ghost':
                variantStyles = "hover:bg-gray-100 hover:text-gray-900"
                break
        }

        let sizeStyles = ""
        switch (size) {
            case 'default':
                sizeStyles = "h-10 px-4 py-2"
                break
            case 'sm':
                sizeStyles = "h-9 rounded-md px-3"
                break
            case 'lg':
                sizeStyles = "h-11 rounded-md px-8"
                break
            case 'icon':
                sizeStyles = "h-10 w-10"
                break
        }

        const widthStyles = fullWidth ? "w-full" : ""

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${className}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
