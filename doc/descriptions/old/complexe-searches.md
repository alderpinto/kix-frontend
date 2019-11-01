# KIX Objekt Suchen

## Suche einbinden (Bsp. ASP-Suche)

### Suche-Kontext implementieren und Formularkonfiguration zur Verfügung stellen
- "kix-module"-Extension registrieren

```
"kix:module": {
    ...,
    "search-contact-dialog-context": "../../dist/registry-modules/customer/search-contact-dialog-context.extension"
}
```
- Context und ContextConfiguration implementieren (`@kix/core/browser`)
    - SearchContactContext
    - SearchContactContextConfiguration

- Context registrieren (`ContactService`)

```
const searchContactContext = new ContextDescriptor(
            ContactSearchContext.CONTEXT_ID, KIXObjectType.CONTACT, ContextType.DIALOG, ContextMode.SEARCH,
            false, 'search-contact-dialog', ContactSearchContext
        );
await ContextService.getInstance().registerContext(searchContactContext);
```
### Suchdefinition und Ergebnistabelle registrieren

- `SearchDefinition` implementieren (`ContactSearchDefinition`)
- `SearchDefinition` registrieren
```
SearchService.getInstance().registerSearchDefinition(new ContactSearchDefinition());
```
- Funktion `getTreeNodes` implementieren (`FAQService` - für Werte der Dropdown-Felder)
- Funktion `prepareFullTextFilter` implementieren (`FAQService`)

### Suchdialog implementieren & registrieren
- Komponente implementieren `src/components/customer/dialogs/search-contact-dialog`
- im Service (`ContactService`) registrieren
```
DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
            'search-contact-dialog',
            new WidgetConfiguration(null,null,null,
                'search-contact-dialog', 'Ansprechpartner',[], null, null, false, false, WidgetSize.BOTH, 'kix-icon-man-bubble'
            ),
            KIXObjectType.CONTACT,
            ContextMode.SEARCH
        ));
```
- Marko.js-Komponenten registrieren (`src/registry-modules/customer/customer-marko.extension`)