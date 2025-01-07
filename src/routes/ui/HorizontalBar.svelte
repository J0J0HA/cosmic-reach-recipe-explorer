<script>
let { children, align = "center", ...restProps } = $props();
</script>

<div style:--align={align} {...restProps}>
    {@render children?.()}
</div>

<style>
    div {
        display: flex;

        flex-direction: row;
        justify-content: var(--align);
        box-sizing: border-box;
        flex-wrap: wrap;
        align-items: center;
    }
</style>
