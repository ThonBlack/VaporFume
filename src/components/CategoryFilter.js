export default function CategoryFilter({ categories, activeCategory, onSelect }) {
    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            padding: '4px',
            marginBottom: '32px',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none' // IE/Edge
        }}>
            <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '99px',
                        border: activeCategory === cat.id ? '1px solid var(--primary)' : '1px solid rgba(0,0,0,0.1)',
                        background: activeCategory === cat.id ? 'var(--primary)' : '#eaeaea', // High contrast background for unselected
                        color: activeCategory === cat.id ? '#000' : '#444', // Dark text on light background
                        fontWeight: activeCategory === cat.id ? '600' : '500',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {cat.name}
                </button>
            ))}
        </div>
    );
}
