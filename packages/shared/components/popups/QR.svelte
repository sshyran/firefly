<script lang="typescript">
    import { QR, Text } from 'shared/components'
    import type { MessageFormatter } from 'shared/lib/i18n'

    export let locale: MessageFormatter
    export let data
</script>

<Text type="h4" classes="mb-5">{locale('popups.password.title')}</Text>
<div class="flex justify-center w-full">
    <QR {data} />
</div>
