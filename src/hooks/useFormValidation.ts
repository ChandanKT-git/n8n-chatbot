import { useState, useCallback } from 'react'
import { isValidEmail, isValidPassword } from '../utils'

interface ValidationErrors {
    [key: string]: string
}

interface UseFormValidationProps {
    initialValues: Record<string, any>
    validationRules: Record<string, (value: any, allValues?: Record<string, any>) => string | null>
}

export function useFormValidation({ initialValues, validationRules }: UseFormValidationProps) {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState<ValidationErrors>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const validateField = useCallback((name: string, value: any) => {
        const rule = validationRules[name]
        if (rule) {
            return rule(value, values)
        }
        return null
    }, [validationRules, values])

    const validateAll = useCallback(() => {
        const newErrors: ValidationErrors = {}
        let isValid = true

        Object.keys(validationRules).forEach(name => {
            const error = validateField(name, values[name])
            if (error) {
                newErrors[name] = error
                isValid = false
            }
        })

        setErrors(newErrors)
        return isValid
    }, [validationRules, values, validateField])

    const handleChange = useCallback((name: string, value: any) => {
        setValues(prev => ({ ...prev, [name]: value }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }, [errors])

    const handleBlur = useCallback((name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }))

        const error = validateField(name, values[name])
        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }))
        }
    }, [validateField, values])

    const reset = useCallback(() => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
    }, [initialValues])

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        reset,
    }
}

// Common validation rules
export const authValidationRules = {
    login: {
        email: (value: string) => {
            if (!value) return 'Email is required'
            if (!isValidEmail(value)) return 'Please enter a valid email address'
            return null
        },
        password: (value: string) => {
            if (!value) return 'Password is required'
            return null
        },
    },
    signup: {
        email: (value: string) => {
            if (!value) return 'Email is required'
            if (!isValidEmail(value)) return 'Please enter a valid email address'
            return null
        },
        password: (value: string) => {
            if (!value) return 'Password is required'
            if (!isValidPassword(value)) return 'Password must be at least 8 characters long'
            return null
        },
        confirmPassword: (value: string, allValues?: Record<string, any>) => {
            if (!value) return 'Please confirm your password'
            if (allValues && value !== allValues.password) return 'Passwords do not match'
            return null
        },
    },
}