import React from 'react'
import { Card, CardActions, createStyles, withStyles, Theme, WithStyles, CardContent, CardMedia, Button, Typography } from '@material-ui/core'
import withBuilderExtension from '../HOC/withBuilderExtension'
import { InlineStyleAware } from '../../common/Builder'

const styles = ({ palette, spacing }: Theme) => createStyles({
    card: {
        maxWidth: 345
    },
    media: {
        height: 0,
        paddingTop: '56.25%' // 16:9
    }
})

interface ISimpleMediaCardProps extends WithStyles<typeof styles>, InlineStyleAware {
    foo?: number
    bar?: boolean
}

const simpleMediaCard: React.SFC<ISimpleMediaCardProps> = props => {
    const { classes } = props
    console.log(props)
    return (
        <div>
            <Card className={classes.card}>
                <CardMedia
                    className={classes.media}
                    image="/static/images/cards/contemplative-reptile.jpg"
                    title="Contemplative Reptile"
                />
                <CardContent>
                    <Typography gutterBottom variant="headline" component="h2">
                        Lizard
                    </Typography>
                    <Typography component="p">
                        Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
                        across all continents except Antarctica
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" color="primary">
                        Share
                    </Button>
                    <Button size="small" color="primary">
                        Learn More
                    </Button>
                </CardActions>
            </Card>
        </div>
    )
}

export default withStyles(styles, { name: 'SimpleMediaCard' })(withBuilderExtension(simpleMediaCard))
// export default withStyles(styles)(simpleMediaCard)
