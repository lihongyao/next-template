最终架构图

```
app/
 └── [locale]
      └── (responsive)
           └── layout.tsx
                ↓
         ResponsiveShell
                ↓
      ┌─────────┴─────────┐
 DesktopShell        MobileShell
                         ↓
                Level1 / Level2
routes
```
