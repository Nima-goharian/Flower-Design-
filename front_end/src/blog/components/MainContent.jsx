import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';

const cardData = [/* same data */];

const SyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: '100%',
  backgroundColor: (theme.vars || theme).palette.background.paper,
  '&:hover': {
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '2px',
  },
}));

const SyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 16,
  flexGrow: 1,
  '&:last-child': {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

function Author({ authors }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
        <AvatarGroup max={3}>
          {authors.map((author, index) => (
            <Avatar key={index} alt={author.name} src={author.avatar} sx={{ width: 24, height: 24 }} />
          ))}
        </AvatarGroup>
        <Typography variant="caption">
          {authors.map((author) => author.name).join(', ')}
        </Typography>
      </Box>
      <Typography variant="caption">July 14, 2021</Typography>
    </Box>
  );
}

export function Search() {
  return (
    <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search…"
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{ 'aria-label': 'search' }}
      />
    </FormControl>
  );
}

export default function MainContent() {
  const [focusedCardIndex, setFocusedCardIndex] = useState(null);

  const handleFocus = (index) => setFocusedCardIndex(index);
  const handleBlur = () => setFocusedCardIndex(null);
  const handleClick = () => console.info('You clicked the filter chip.');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div>
        <Typography variant="h1" gutterBottom>Blog</Typography>
        <Typography>Stay in the loop with the latest about our products</Typography>
      </div>
      {/* mobile filters and RSS */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'row', gap: 1, width: { xs: '100%', md: 'fit-content' }, overflow: 'auto' }}>
        <Search />
        <IconButton size="small" aria-label="RSS feed">
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>
      {/* filter chips and search for desktop */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row' }, width: '100%', justifyContent: 'space-between', alignItems: { xs: 'start', md: 'center' }, gap: 4, overflow: 'auto' }}>
        <Box sx={{ display: 'inline-flex', flexDirection: 'row', gap: 3, overflow: 'auto' }}>
          {['All categories', 'Company', 'Product', 'Design', 'Engineering'].map((label) => (
            <Chip key={label} onClick={handleClick} size="medium" label={label} sx={{ backgroundColor: 'transparent', border: 'none' }} />
          ))}
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'row', gap: 1, width: { xs: '100%', md: 'fit-content' }, overflow: 'auto' }}>
          <Search />
          <IconButton size="small" aria-label="RSS feed">
            <RssFeedRoundedIcon />
          </IconButton>
        </Box>
      </Box>
      {/* Cards Grid */}
      <Grid container spacing={2} columns={12}>
        {cardData.map((card, index) => (
          <Grid key={index} size={{ xs: 12, md: index < 2 ? 6 : 4 }}>
            <SyledCard
              variant="outlined"
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              tabIndex={0}
              className={focusedCardIndex === index ? 'Mui-focused' : ''}
              sx={{ height: '100%' }}
            >
              {index !== 3 && index !== 4 && (
                <CardMedia
                  component="img"
                  alt={card.title}
                  image={card.img}
                  sx={{
                    aspectRatio: '16 / 9',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    height: { sm: 'auto', md: index >= 2 ? '50%' : 'auto' },
                  }}
                />
              )}
              <SyledCardContent>
                <Typography gutterBottom variant="caption" component="div">
                  {card.tag}
                </Typography>
                <Typography gutterBottom variant="h6" component="div">
                  {card.title}
                </Typography>
                <StyledTypography variant="body2" color="text.secondary" gutterBottom>
                  {card.description}
                </StyledTypography>
              </SyledCardContent>
              <Author authors={card.authors} />
            </SyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
