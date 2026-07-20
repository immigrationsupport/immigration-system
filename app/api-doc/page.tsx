'use client';

import { useEffect, useRef } from 'react';
import 'swagger-ui-dist/swagger-ui.css';

export default function ApiDocPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        import('swagger-ui-dist').then((module) => {
            const SwaggerUIBundle = module.SwaggerUIBundle;
            SwaggerUIBundle({
                url: '/api/api-doc',
                domNode: containerRef.current,
            });
        });
    }, []);

    return <div ref={containerRef} />;
}