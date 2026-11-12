# Clarix — Especificación vigente y comparación con el plan original

## Propósito de este documento

Este documento deja explícita la diferencia entre tres cosas:

1. lo que el código hace hoy
2. lo que el plan original de producto proponía
3. lo que queda pendiente por decidir antes de evolucionar la aplicación

Este primer PR está limitado a documentación. No incluye cambios funcionales ni de comportamiento.

## Alcance y contexto

El plan original describe un SaaS con un agente de IA que guía a analistas de negocio, consultores y responsables operativos a través de una metodología completa:

- contextualización del problema
- análisis AS-IS
- definición del resultado deseado
- propuesta TO-BE
- análisis de brechas
- plan de acción
- documento final exportable

El código actual de Clarix implementa una versión funcional de ese flujo, pero como prototipo guiado y generador de reportes más que como producto completo de SaaS.

Archivos clave:

- `app/page.tsx`
- `app/analyze/page.tsx`
- `app/api/analyze/route.ts`
- `app/api/analyze/phase2/route.ts`
- `app/api/analyze/phase3/route.ts`
- `app/api/analyze/phase4/route.ts`
- `app/api/analyze/phase5/route.ts`
- `app/api/analyze/phase6/route.ts`
- `app/api/leads/route.ts`
- `supabase/migrations/create_leads_table.sql`

## Resumen ejecutivo

### Estado actual

La aplicación incluye un flujo de diagnóstico guiado con prompts de Anthropic y generación de resultados por fases. Sin embargo, el repo todavía se encuentra en un estado de MVP de diagnóstico, no de plataforma operativa.

Lo que sí está implementado:

- landing page y forma de captura de leads
- wizard para diagnóstico de procesos
- prompts por fase del flujo analítico
- generación de diagramas AS-IS y TO-BE
- revisión de brechas y plan de acción
- vista final para presentación e impresión

Lo que todavía no está implementado de forma productiva:

- autenticación real de usuarios
- sesiones persistidas por análisis
- plan de precios y billing real
- export real de PDF generado en servidor
- persistencia del análisis por usuario y versión
- gobernanza del flujo con datos estructurados y validaciones duraderas

## Diferencia entre plan original, código actual y decisiones pendientes

### Fase 1 — Context & Positioning

Estado: implementado.

Qué está en el código:

- `app/analyze/page.tsx` incorpora preguntas para:
  - área de proceso
  - descripción de la compañía o equipo
  - cantidad de personas involucradas
  - problema actual
  - duración del problema
  - objetivos principales prioridad ordenada
  - hipótesis de causa raíz
- `app/api/analyze/route.ts` toma esos datos y genera un resumen inicial con Claude.

Diferencias con el plan original:

- El plan original contempla un proceso más estructurado y narrativo. El código actual lo resuelve como flujo guiado.
- No hay persistencia del contexto inicial de usuario ni sesión real.

Pendiente:

- decidir si cada diagnóstico debe guardarse en una sesión persistida
- definir si los objetivos deben revalidarse después de la propuesta TO-BE

### Fase 2 — AS-IS analysis

Estado: implementado.

Qué está en el código:

- `app/analyze/page.tsx` incluye preguntas sobre:
  - pasos del proceso
  - roles involucrados
  - tareas manuales
  - cuello de botella
  - redundancias
  - cambios recientes del entorno
  - documentos de soporte
- `app/api/analyze/phase2/route.ts` genera:
  - análisis AS-IS en markdown
  - flowchart SVG
  - diagrama de causa y efecto / Ishikawa

Diferencias con el plan original:

- El plan original propone un “checkpoint” de validación del proceso actual. El código presenta esa validación en la experiencia de usuario, pero no hay versión histórica ni auditoría del análisis.
- Los documentos cargados no se usan como contenido analítico persistente; se usan como insumo textual del flujo.

Pendiente:

- definir si la carga de documentos formará parte del análisis real o solo de soporte documental
- decidir si esta fase se conserva como evento histórico de la sesión

### Fase 3 — Outcome

Estado: implementado.

Qué está en el código:

- `app/analyze/page.tsx` incluye definición de visión de éxito en 6–12 meses y métricas.
- `app/api/analyze/phase3/route.ts` genera la sección “TO-BE Vision” y una tabla de métricas.

Diferencias con el plan original:

- El plan original habla de una fase clara de definición de resultado. La implementación la refleja.
- La versión actual no exige una definición formal de audiencia ni presentación ejecutiva.

Pendiente:

- definir si esta fase debe producir un resumen ejecutivo formal o una salida más práctica para una sesión

### Fase 4 — TO-BE

Estado: implementado.

Qué está en el código:

- `app/analyze/page.tsx` incluye:
  - validación de la propuesta por parte del usuario
  - restricciones del negocio
  - off-limits
  - simplificación del plan
- `app/api/analyze/phase4/route.ts` genera:
  - propuesta TO-BE
  - cronograma de implementación
  - diagrama de flujo TO-BE
  - versión simplificada cuando corresponde

Diferencias con el plan original:

- El plan original menciona una evaluación formal de factibilidad, impacto entre áreas y tamaño de la organización. La implementación actual resuelve esto con prompts, pero no con reglas explícitas de negocio.
- El manejo de “simplify” existe, pero no hay una norma formal de negocio para cuándo una propuesta debe simplificarse.

Pendiente:

- definir reglas operativas para simplificación de propuestas
- decidir si los off-limits deben bloquear por completo o solo limitar la recomendación

### Fase 5 — Gap Analysis

Estado: implementado.

Qué está en el código:

- `app/analyze/page.tsx` incluye una matriz con cuadrantes Quick Win, Strategic, Low Priority y Reconsider.
- `app/api/analyze/phase5/route.ts` genera brechas con:
  - nombre
  - categoría
  - impacto
  - esfuerzo
  - costo
  - clasificación
- el usuario puede reordenar brechas o agregarlas manualmente

Diferencias con el plan original:

- El plan original especifica que Quick Wins son: alto impacto, bajo esfuerzo y bajo costo.
- El prompt actual en `app/api/analyze/phase5/route.ts` define Quick Win como: impacto alto o medio + esfuerzo bajo.
- Eso deja abierta la regla de clasificación y es la diferencia más relevante que requiere decisión del negocio.

Pendiente: decisión crítica

- definir explícitamente la regla de Quick Wins
- decidir si el costo entra en la definición o es solo un descriptor
- decidir si un gap con impacto medio, esfuerzo bajo y costo alto puede ser Quick Win

### Fase 6 — Action Plan

Estado: implementado.

Qué está en el código:

- `app/analyze/page.tsx` muestra un plan de acción por brecha
- `app/api/analyze/phase6/route.ts` genera:
  - acciones por gap
  - clasificación de cada acción
  - responsables
  - pasos
  - timeline
  - KPI
  - beneficio esperado
  - resistencia y plan de comunicación

Diferencias con el plan original:

- El plan original pide un plan de acción más estructurado, detallado y orientado a ejecución.
- La implementación existente genera un flujo útil, pero no se guarda de forma persistente ni se valida contra dependencias reales y tiempos del negocio.
- El plan original hablaba de export final a PDF. El código actual usa una vista de impresión para presentación, no un PDF real generado en backend.

Pendiente:

- definir si la fase 6 debe seguir siendo “documento persuasivo” o “documento ejecutivo formal”
- decidir si el sistema debe asociar cada acción a una brecha explícita o permitir acciones de apoyo más generales

## Decisiones que requieren confirmación del negocio

### 1) Regla de Quick Wins

Esta es la decisión más importante del documento.

La regla original del plan dice:

- Quick Wins = alto impacto, bajo esfuerzo, bajo costo

La regla actual del prompt dice:

- Quick Win = impacto alto o medio + esfuerzo bajo

Eso significa que el producto actual no tiene una regla de negocio verificable que coincida con el plan original. El comportamiento del prompt puede cambiar según el modelo y la sesión.

Recomendación de documentación para el primer PR:

- dejar la regla como decisión pendiente
- no codificar una regla nueva sin aprobación del negocio
- documentar los dos enfoques y el criterio que se tomará en la siguiente iteración

### 2) Export real de PDF

El código actual no genera un PDF real en servidor; sí hay impresión del navegador.

Pendiente:

- aceptar `window.print()` como export MVP
- o definir una librería de export con render server-side

### 3) Persistencia de sesiones

El flujo actual no guarda devoluciones por usuario ni archivo final asociado a una sesión.

Pendiente:

- definir si el MVP debe guardar análisis por usuario
- o si el producto seguirá siendo una sesión efímera y local

### 4) Autenticación, monetización y pricing

El repo actual tiene lead capture, no autenticación real ni billing.

- `app/page.tsx` captura leads
- `app/api/leads/route.ts` registra lead
- `supabase/migrations/create_leads_table.sql` crea la tabla `leads`

No hay Stripe ni planes de pago.

Pendiente:

- definir si Clarix será un flujo de lead generation con follow-up manual
- o si se quiere un MVP con planes de pago y autenticación

## Criterios de aceptación verificables

### Fase 1

Debe poder:

- recoger contexto del proceso y del problema
- aceptar hasta tres objetivos con orden de prioridad
- validar que cada campo requerido se completó antes de avanzar

Criterio verificable:

- el wizard no permite avanzar si faltan campos obligatorios
- la salida del backend incluye proceso, problema, objetivo y causa raíz

### Fase 2

Debe poder:

- describir el proceso actual
- identificar cuellos de botella y pasos manuales
- generar un diagnóstico AS-IS y diagrama de causa y efecto

Criterio verificable:

- la respuesta incluye análisis AS-IS estructurado
- se genera al menos un SVG de flowchart o Ishikawa
- la respuesta menciona explícitamente cuellos de botella, pasos manuales y cambios recientes

### Fase 3

Debe poder:

- definir una visión de éxito en 6–12 meses
- transformar objetivos en métricas cuantificables

Criterio verificable:

- la salida incluye sección `TO-BE Vision`
- la tabla de métricas tiene máximo 5 filas
- cada fila incluye objetivo, métrica, estado actual, meta y plazo

### Fase 4

Debe poder:

- proponer un TO-BE realista
- respetar restricciones y off-limits
- simplificar el plan cuando corresponde

Criterio verificable:

- el contenido generado respeta todas las restricciones informadas
- no se sugieren acciones que contradigan off-limits
- si `simplify=true`, la propuesta reduce alcance y desplaza tiempos de implementación

### Fase 5

Debe poder:

- generar brechas priorizadas
- clasificar cada brecha con criterios claros
- dejar revisión humana del resultado

Criterio verificable:

- máximo 6 brechas
- cada brecha tiene categoría, impacto, esfuerzo, costo y clasificación
- la clasificación Quick Win cumple la regla aprobada por el negocio
- no se incluyen brechas dentro de los off-limits

### Fase 6

Debe poder:

- generar un plan de acción por brecha
- asignar responsables
- definir KPI y cronograma

Criterio verificable:

- existe una acción por cada brecha
- quick wins aparecen primero
- cada acción incluye responsable, pasos, KPI, beneficio esperado y timeline
- el plan incluye una sección de Change Management

## Regla recomendada para Quick Wins

Para evitar ambigüedad, la regla más clara y consistente con el plan original es:

- Quick Win = impacto alto, esfuerzo bajo y costo bajo

Si se quiere una regla más flexible, habría que definirla explícitamente y documentarla antes de seguir desarrollando prompts. La regla actual del prompt no es verificable ni consistente con la intención del plan original.

## Estado del PR

Este PR documenta:

- el flujo funcional actual del proyecto
- la comparación con el plan original
- la diferencia entre intención de producto, implementación actual y decisiones aún abiertas
- los criterios de aceptación verificables por fase

No incluye cambios de comportamiento ni nuevas funcionalidades. Es un PR de documentación, como se solicitó.

## Enlaces a archivos relevantes

- `README.md`
- `app/page.tsx`
- `app/analyze/page.tsx`
- `app/api/analyze/route.ts`
- `app/api/analyze/phase2/route.ts`
- `app/api/analyze/phase3/route.ts`
- `app/api/analyze/phase4/route.ts`
- `app/api/analyze/phase5/route.ts`
- `app/api/analyze/phase6/route.ts`
- `supabase/migrations/create_leads_table.sql`

## Cierre

El proyecto actual está bien posicionado como prototipo de producto de diagnóstico basado en IA, pero no como SaaS completamente operativo. Este documento sirve como base para que una persona externa al código entienda la diferencia entre la idea original, la implementación actual y las decisiones funcionales que aún quedan abiertas.

La decisión más crítica que necesita aprobación es la regla de Quick Wins, seguida por la decisión sobre PDF real, persistencia de sesión y modelo de monetización.
